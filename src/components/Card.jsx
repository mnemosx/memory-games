export const Card = props => {
  const { src, alt, children } = props

  return (
    <div className="mx-6 w-36 card shadow-sm bg-primary">
      <figure>
        <img src={src} alt={alt} />
      </figure>
      <div className="card-body p-3 text-lg text-center text-neutral-content">
        {children}
      </div>
    </div>
  )
}
