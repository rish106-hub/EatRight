/**
 * Inline validation message. Pairs an icon + text so the error is never
 * signalled by colour alone. Link via aria-describedby + the matching id.
 */
export function FieldError({
  id,
  message,
}: {
  id: string;
  message?: string | undefined;
}) {
  if (!message) {
    return null;
  }
  return (
    <p id={id} className="field-error">
      <span className="field-error__icon" aria-hidden="true">
        !
      </span>
      {message}
    </p>
  );
}
