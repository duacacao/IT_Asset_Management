import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Laptop, FileText, Database, Clock } from 'lucide-react';
import { Device } from '@/types/device';

interface StatsCardsProps {
    devices: Device[];
}

export function StatsCards({ devices }: StatsCardsProps) {
    const totalDevices = devices.length;
    const totalSheets = devices.reduce((sum, d) => sum + d.metadata.totalSheets, 0);
    const totalRecords = devices.reduce((sum, d) => sum + d.metadata.totalRows, 0);

    const latestDevice = devices.length > 0
        ? devices.reduce((latest, d) =>
            new Date(d.metadata.importedAt) > new Date(latest.metadata.importedAt) ? d : latest
        )
        : null;

    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Devices</CardTitle>
                    <Laptop className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{totalDevices}</div>
                    <p className="text-xs text-muted-foreground mt-1">
                        Devices managed
                    </p>
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Sheets</CardTitle>
                    <FileText className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{totalSheets}</div>
                    <p className="text-xs text-muted-foreground mt-1">
                        Data sheets
                    </p>
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Records</CardTitle>
                    <Database className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{totalRecords.toLocaleString()}</div>
                    <p className="text-xs text-muted-foreground mt-1">
                        Total rows
                    </p>
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Latest Import</CardTitle>
                    <Clock className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    {latestDevice ? (
                        <>
                            <div className="text-lg font-bold truncate">
                                {latestDevice.deviceInfo.name}
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">
                                {new Date(latestDevice.metadata.importedAt).toLocaleDateString()}
                            </p>
                        </>
                    ) : (
                        <div className="text-sm text-muted-foreground">No devices yet</div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
