export default function Button({ variant = 'primary', disabled, title, children, ...props }) {
  return (
    <button
      className={`btn btn--${variant}${disabled ? ' btn--disabled' : ''}`}
      disabled={disabled}
      title={title}
      {...props}
    >
      {children}
    </button>
  );
}
