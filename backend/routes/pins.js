const express   = require('express');
const { PutObjectCommand }              = require('@aws-sdk/client-s3');
const { DetectModerationLabelsCommand } = require('@aws-sdk/client-rekognition');
const { getSignedUrl }                  = require('@aws-sdk/s3-request-presigner');
const { v4: uuidv4 }                    = require('uuid');
const auth  = require('../middleware/auth');
const Pin   = require('../models/Pin');
const User  = require('../models/User');
const { s3, rekognition } = require('../config/aws');

const BLOCKED_LABELS = [
  'Explicit Nudity', 'Nudity', 'Graphic Male Nudity', 'Graphic Female Nudity',
  'Sexual Activity', 'Illustrated Nudity Or Sexual Activity',
  'Adult Content', 'Graphic Violence Or Gore', 'Violence',
  'Visually Disturbing', 'Drugs', 'Tobacco', 'Hate Symbols',
];

async function moderateImage(bucket, key) {
  const cmd = new DetectModerationLabelsCommand({
    Image: { S3Object: { Bucket: bucket, Name: key } },
    MinConfidence: 70,
  });
  const { ModerationLabels = [] } = await rekognition.send(cmd);
  const blocked = ModerationLabels.filter(l => BLOCKED_LABELS.includes(l.Name));
  return blocked;
}

const router = express.Router();
const BUCKET = process.env.S3_BUCKET_NAME;

router.get('/', auth, async (req, res) => {
  try {
    const filter = {};
    if (req.query.saved === 'true') filter._id = { $in: req.user.savedPins || [] };
    if (req.query.category) filter.category = req.query.category;
    if (req.query.q) {
      const re = new RegExp(req.query.q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
      filter.$or = [{ title: re }, { description: re }, { category: re }];
    }
    const pins   = await Pin.find(filter).sort({ createdAt: -1 }).limit(100)
      .populate('author', 'username avatarUrl name')
      .populate('comments.user', 'username avatarUrl');

    const savedIds = new Set((req.user.savedPins || []).map(id => id.toString()));
    const result   = pins.map(p => ({
      ...p.toObject(),
      saved:    savedIds.has(p._id.toString()),
      liked:    p.likes.map(id => id.toString()).includes(req.user._id.toString()),
      likesCount: p.likes.length,
    }));
    res.json({ pins: result });
  } catch (err) { res.status(500).json({ message: 'Error al obtener pins.' }); }
});

router.post('/presign', auth, async (req, res) => {
  try {
    const { filename, contentType } = req.body;
    if (!contentType?.startsWith('image/'))
      return res.status(400).json({ message: 'Solo se permiten archivos de imagen.' });
    const ext = filename.split('.').pop().toLowerCase();
    const key = `pins/${req.user._id}/${uuidv4()}.${ext}`;
    const url = await getSignedUrl(s3, new PutObjectCommand({
      Bucket: BUCKET, Key: key, ContentType: contentType,
    }), { expiresIn: 300 });
    res.json({ uploadUrl: url, key });
  } catch (err) { console.error(err); res.status(500).json({ message: 'Error generando URL.' }); }
});

router.post('/', auth, async (req, res) => {
  try {
    const { title, description, category, s3Key } = req.body;
    if (!title || !s3Key) return res.status(400).json({ message: 'Título e imagen requeridos.' });

    const flagged = await moderateImage(BUCKET, s3Key).catch(() => []);
    if (flagged.length > 0) {
      await s3.send(new (require('@aws-sdk/client-s3').DeleteObjectCommand)({ Bucket: BUCKET, Key: s3Key })).catch(() => {});
      return res.status(422).json({
        message: 'La imagen fue rechazada por contener contenido inapropiado.',
        labels: flagged.map(l => l.Name),
      });
    }

    const region   = process.env.AWS_REGION || 'us-east-1';
    const imageUrl = `https://${BUCKET}.s3.${region}.amazonaws.com/${s3Key}`;
    const pin = await Pin.create({ title, description, category, s3Key, imageUrl, author: req.user._id });
    await pin.populate('author', 'username avatarUrl name');
    res.status(201).json({ ...pin.toObject(), liked: false, likesCount: 0, saved: false });
  } catch (err) { res.status(500).json({ message: 'Error al guardar pin.' }); }
});

router.post('/:id/save', auth, async (req, res) => {
  try {
    const pin  = await Pin.findById(req.params.id);
    if (!pin) return res.status(404).json({ message: 'Pin no encontrado.' });
    const user     = await User.findById(req.user._id);
    const idx      = user.savedPins.indexOf(pin._id);
    const saved    = idx === -1;
    if (saved) { user.savedPins.push(pin._id); pin.saves++; }
    else        { user.savedPins.splice(idx, 1); pin.saves = Math.max(0, pin.saves - 1); }
    await Promise.all([user.save(), pin.save()]);
    res.json({ saved, saves: pin.saves });
  } catch { res.status(500).json({ message: 'Error.' }); }
});

router.post('/:id/like', auth, async (req, res) => {
  try {
    const pin = await Pin.findById(req.params.id);
    if (!pin) return res.status(404).json({ message: 'Pin no encontrado.' });
    const uid = req.user._id.toString();
    const idx = pin.likes.map(id => id.toString()).indexOf(uid);
    const liked = idx === -1;
    if (liked) pin.likes.push(req.user._id);
    else        pin.likes.splice(idx, 1);
    await pin.save();
    res.json({ liked, likesCount: pin.likes.length });
  } catch { res.status(500).json({ message: 'Error.' }); }
});

router.post('/:id/comment', auth, async (req, res) => {
  try {
    const { text } = req.body;
    if (!text?.trim()) return res.status(400).json({ message: 'Comentario vacío.' });
    const pin = await Pin.findById(req.params.id);
    if (!pin) return res.status(404).json({ message: 'Pin no encontrado.' });
    pin.comments.push({ user: req.user._id, text: text.trim() });
    await pin.save();
    await pin.populate('comments.user', 'username avatarUrl');
    const comment = pin.comments[pin.comments.length - 1];
    res.status(201).json(comment);
  } catch { res.status(500).json({ message: 'Error al comentar.' }); }
});

router.delete('/:id', auth, async (req, res) => {
  try {
    const pin = await Pin.findById(req.params.id);
    if (!pin) return res.status(404).json({ message: 'Pin no encontrado.' });
    if (pin.author.toString() !== req.user._id.toString())
      return res.status(403).json({ message: 'No autorizado.' });
    if (pin.s3Key) {
      const { DeleteObjectCommand } = require('@aws-sdk/client-s3');
      await s3.send(new DeleteObjectCommand({ Bucket: BUCKET, Key: pin.s3Key })).catch(() => {});
    }
    await pin.deleteOne();
    res.json({ message: 'Pin eliminado.' });
  } catch { res.status(500).json({ message: 'Error.' }); }
});

router.delete('/:id/comment/:commentId', auth, async (req, res) => {
  try {
    const pin     = await Pin.findById(req.params.id);
    const comment = pin?.comments.id(req.params.commentId);
    if (!comment) return res.status(404).json({ message: 'Comentario no encontrado.' });
    if (comment.user.toString() !== req.user._id.toString())
      return res.status(403).json({ message: 'No autorizado.' });
    comment.deleteOne();
    await pin.save();
    res.json({ message: 'Eliminado.' });
  } catch { res.status(500).json({ message: 'Error.' }); }
});

module.exports = router;
