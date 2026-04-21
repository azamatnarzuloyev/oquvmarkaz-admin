import ProjectOverview from './components/ProjectOverview'

const ControlDashboard = () => {
    return (
        <div className="p-6 bg-gray-50/50 min-h-full">
            <div className="mb-6">
                <h1 className="text-xl font-bold text-gray-900">Boshqaruv paneli</h1>
                <p className="text-xs text-gray-400 mt-0.5">Tizim bo'yicha umumiy statistika</p>
            </div>
            <ProjectOverview />
        </div>
    )
}

export default ControlDashboard
