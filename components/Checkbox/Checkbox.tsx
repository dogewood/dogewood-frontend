import styles from './Checkbox.module.css'

export default function Checkbox({
  className = '',
  label = '',
  isChecked = false,
  onChecked,
  ...props
}) {
  return (
    <li {...props} className={[styles.checkbox, className].join(' ')}>
      <input
        className={styles.customCheckbox}
        id="styled-checkbox-1"
        type="checkbox"
        checked={isChecked}
        onClick={() => onChecked(!isChecked)}
      />
      {label && <label htmlFor="styled-checkbox-1">{label}</label>}
    </li>
  )
}
