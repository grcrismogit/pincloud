export default function Logo({ size = 20, color = '#fff' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={color} aria-hidden="true" focusable="false">
      <path d="M12 2C8.13 2 5 5.13 5 9c0 3.87 4.5 10.5 6.5 13.26.28.37.72.74 1 .74s.72-.37 1-.74C14.5 19.5 19 12.87 19 9c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5S10.62 6.5 12 6.5s2.5 1.12 2.5 2.5S13.38 11.5 12 11.5z" />
    </svg>
  )
}
