interface EventStepProp {
  step: string
  title: string
  description: string
}

const EventStep = ({ step, title, description }: EventStepProp) => {
  return (
    <div className="flex flex-col items-center justify-center gap-y-6">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-500 p-10 text-2xl font-bold text-white">
        {step}
      </div>
      <h3 className="text-2xl font-bold tracking-wide text-center">{title}</h3>
      <p className="text-center text-xl text-muted-foreground">{description}</p>
    </div>
  )
}

export default EventStep
