import styles from './Button.module.css'

export default function Button({
  className = '',
  href = '',
  target = '_blank',
  ...props
}) {
  return href ? (
    <a href={href} target={target}>
      <button {...props} className={[styles.button, className].join(' ')} />
    </a>
  ) : (
    <button {...props} className={[styles.button, className].join(' ')} />
  )
}
