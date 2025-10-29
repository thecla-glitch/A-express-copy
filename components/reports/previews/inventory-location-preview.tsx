"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/layout/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/layout/table"
import { Badge } from "@/components/ui/core/badge"

interface InventoryLocationReport {
    locations: {
        location: string
        laptop_count: number
        capacity: number
        utilization: number
    }[]
    summary: {
        total_laptops: number
        total_capacity: number
        overall_utilization: number
    }
}

export const InventoryLocationPreview = ({ report }: { report: InventoryLocationReport }) => {
    return (
        <div className="space-y-6">
            <div className="grid gap-4 md:grid-cols-3">
                <Card><CardContent className="p-4"><p className="text-sm text-gray-600">Total Laptops</p><p className="text-2xl font-bold text-gray-900">{report.summary.total_laptops}</p></CardContent></Card>
                <Card><CardContent className="p-4"><p className="text-sm text-gray-600">Total Capacity</p><p className="text-2xl font-bold text-blue-600">{report.summary.total_capacity}</p></CardContent></Card>
                <Card><CardContent className="p-4"><p className="text-sm text-gray-600">Overall Utilization</p><p className="text-2xl font-bold text-green-600">{report.summary.overall_utilization}%</p></CardContent></Card>
            </div>

            <Card>
                <CardHeader><CardTitle>Inventory by Location</CardTitle></CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader><TableRow>
                            <TableHead>Location</TableHead><TableHead>Laptop Count</TableHead><TableHead>Capacity</TableHead><TableHead>Utilization</TableHead><TableHead>Status</TableHead>
                        </TableRow></TableHeader>
                        <TableBody>
                            {report.locations.map(location => (
                                <TableRow key={location.location}>
                                    <TableCell className="font-medium">{location.location}</TableCell>
                                    <TableCell>{location.laptop_count}</TableCell>
                                    <TableCell>{location.capacity}</TableCell>
                                    <TableCell>{location.utilization}%</TableCell>
                                    <TableCell>
                                        <Badge variant={
                                            location.utilization >= 90 ? "destructive" :
                                                location.utilization >= 70 ? "secondary" : "default"
                                        }>
                                            {location.utilization >= 90 ? "Full" : location.utilization >= 70 ? "Busy" : "Available"}
                                        </Badge>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    )
}
