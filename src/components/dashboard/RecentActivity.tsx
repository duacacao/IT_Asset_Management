import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Device } from "@/types/device"
import { Laptop, Clock } from "lucide-react"

interface RecentActivityProps {
    devices: Device[]
}

export function RecentActivity({ devices }: RecentActivityProps) {
    // Sort devices by lastUpdate descending and take top 5
    const recentDevices = [...devices]
        .sort((a, b) => {
            const dateA = new Date(a.deviceInfo.lastUpdate).getTime();
            const dateB = new Date(b.deviceInfo.lastUpdate).getTime();
            return dateB - dateA;
        })
        .slice(0, 5);

    return (
        <Card className="col-span-3">
            <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>
                    Latest {recentDevices.length} updated devices
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="space-y-8">
                    {recentDevices.map((device) => (
                        <div key={device.id} className="flex items-center">
                            <Avatar className="h-9 w-9">
                                <AvatarImage src={`https://avatar.vercel.sh/${device.id}.png`} alt={device.deviceInfo.name} />
                                <AvatarFallback>
                                    <Laptop className="h-4 w-4" />
                                </AvatarFallback>
                            </Avatar>
                            <div className="ml-4 space-y-1">
                                <p className="text-sm font-medium leading-none">{device.deviceInfo.name}</p>
                                <p className="text-sm text-muted-foreground">
                                    {device.deviceInfo.os} • {device.deviceInfo.ram}
                                </p>
                            </div>
                            <div className="ml-auto flex items-center text-sm text-muted-foreground">
                                <Clock className="mr-1 h-3 w-3" />
                                {device.deviceInfo.lastUpdate}
                            </div>
                        </div>
                    ))}
                    {recentDevices.length === 0 && (
                        <div className="text-center text-muted-foreground py-4">
                            No activity recorded
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    )
}
