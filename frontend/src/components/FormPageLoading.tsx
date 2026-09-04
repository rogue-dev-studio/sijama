/**
 * @Author: rogue-dev-studio
 * @Date: 2026-09-02 06:40:00
 * @Last Modified by: rogue-dev-studio
 * @Last Modified time: 2026-09-02 06:40:00
 */

type FormPageLoadingProps = {
  title: string
  description?: string
  message: string
}

export function FormPageLoading({ title, description, message }: FormPageLoadingProps) {
  return (
    <>
      <header className="page-header">
        <h1>{title}</h1>
        {description ? <p>{description}</p> : null}
      </header>
      <div className="loading-state" role="status" aria-live="polite">
        {message}
      </div>
    </>
  )
}
