interface StatusCardProps {
  title: string
  value: string | number
  icon: string
}

export default function StatusCard({ title, value, icon }: StatusCardProps) {
  return (
    <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{value.toLocaleString()}</p>
        </div>
        <span className="text-3xl">{icon}</span>
      </div>
    </div>
  )
}
