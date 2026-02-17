export function getDepartmentColor(department: string): string {
    const colors: Record<string, string> = {
        IT: 'bg-purple-100 text-purple-700 border-purple-200',
        'Kế toán': 'bg-green-100 text-green-700 border-green-200',
        'Nhân sự': 'bg-pink-100 text-pink-700 border-pink-200',
        'Kinh doanh': 'bg-orange-100 text-orange-700 border-orange-200',
        Marketing: 'bg-blue-100 text-blue-700 border-blue-200',
        'Kỹ thuật': 'bg-cyan-100 text-cyan-700 border-cyan-200',
        'Hành chính': 'bg-gray-100 text-gray-700 border-gray-200',
        'Tài chính': 'bg-emerald-100 text-emerald-700 border-emerald-200',
        'Pháp lý': 'bg-indigo-100 text-indigo-700 border-indigo-200',
        'Vận hành': 'bg-amber-100 text-amber-700 border-amber-200',
    }
    return colors[department] || 'bg-slate-100 text-slate-700 border-slate-200'
}

export function getPositionColor(position: string): string {
    const colors: Record<string, string> = {
        'Giám đốc': 'bg-red-100 text-red-700 border-red-200',
        'Trưởng phòng': 'bg-orange-100 text-orange-700 border-orange-200',
        'Phó phòng': 'bg-amber-100 text-amber-700 border-amber-200',
        'Trưởng nhóm': 'bg-violet-100 text-violet-700 border-violet-200',
        'Nhân viên': 'bg-blue-100 text-blue-700 border-blue-200',
        'Thực tập': 'bg-green-100 text-green-700 border-green-200',
        'Kế toán trưởng': 'bg-emerald-100 text-emerald-700 border-emerald-200',
        'Kỹ sư': 'bg-cyan-100 text-cyan-700 border-cyan-200',
    }
    return colors[position] || 'bg-slate-100 text-slate-700 border-slate-200'
}
