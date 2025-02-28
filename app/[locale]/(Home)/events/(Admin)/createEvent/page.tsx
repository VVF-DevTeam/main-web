import CreateEventForm from "../_components/CreateEvent"
const CreateEventPage = () => {
  // Check if user is admin
  // TODO: Check Admin status and create event creation page.
  return (
    <div className="mx-auto my-40 w-full max-w-5xl p-8 lg:p-12 xl:p-16">
      <CreateEventForm author="admin" />
    </div>
  )
}

export default CreateEventPage
