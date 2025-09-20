const Switch = ({
  checked,
  onCheckedChange,
}: {
  checked?: boolean
  onCheckedChange: (checked: boolean) => void
}) => {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onCheckedChange(!checked)}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 ease-in-out focus:outline-none focus:ring-offset-2 ${checked ? 'bg-bgColor-brand' : 'bg-gray-300'} `}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 ease-in-out ${checked ? 'translate-x-6' : 'translate-x-1'} `}
      />
    </button>
  )
}

export default Switch