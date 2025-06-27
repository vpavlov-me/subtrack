import { useState } from 'react'
import { Download, FileText, BarChart3, TrendingUp } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { DateRange } from './DateRangePicker'
import { toast } from 'sonner'

interface ReportExporterProps {
  dateRange: DateRange
  data: any
  className?: string
}

type ExportFormat = 'csv' | 'pdf' | 'json'
type ReportType = 'spending' | 'trends' | 'categories' | 'subscriptions'

const REPORT_TYPES = [
  {
    value: 'spending',
    label: 'Spending Report',
    description: 'Detailed spending breakdown by date and category',
    icon: BarChart3
  },
  {
    value: 'trends',
    label: 'Trend Analysis',
    description: 'Spending trends and patterns over time',
    icon: TrendingUp
  },
  {
    value: 'categories',
    label: 'Category Report',
    description: 'Spending by category with percentages',
    icon: FileText
  },
  {
    value: 'subscriptions',
    label: 'Subscription Summary',
    description: 'All active subscriptions and costs',
    icon: Download
  }
]

export function ReportExporter({ dateRange, data, className }: ReportExporterProps) {
  const [selectedType, setSelectedType] = useState<ReportType>('spending')
  const [selectedFormat, setSelectedFormat] = useState<ExportFormat>('csv')
  const [isExporting, setIsExporting] = useState(false)

  const handleExport = async () => {
    setIsExporting(true)
    
    try {
      // Simulate export process
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      const fileName = `subtrack-${selectedType}-${new Date().toISOString().split('T')[0]}.${selectedFormat}`
      
      // In a real implementation, this would generate the actual file
      const blob = new Blob(['Report data would be here'], { type: 'text/plain' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = fileName
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
      
      toast.success(`Report exported as ${fileName}`)
    } catch (error) {
      toast.error('Failed to export report')
    } finally {
      setIsExporting(false)
    }
  }

  const selectedReport = REPORT_TYPES.find(r => r.value === selectedType)
  const Icon = selectedReport?.icon || FileText

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Download className="h-5 w-5" />
          Export Reports
        </CardTitle>
        <CardDescription>
          Export your subscription data and analytics in various formats
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Report Type Selection */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Report Type</label>
          <Select value={selectedType} onValueChange={(value: ReportType) => setSelectedType(value)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {REPORT_TYPES.map((report) => (
                <SelectItem key={report.value} value={report.value}>
                  <div className="flex items-center gap-2">
                    <report.icon className="h-4 w-4" />
                    <div>
                      <div className="font-medium">{report.label}</div>
                      <div className="text-xs text-muted-foreground">{report.description}</div>
                    </div>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Format Selection */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Export Format</label>
          <Select value={selectedFormat} onValueChange={(value: ExportFormat) => setSelectedFormat(value)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="csv">CSV (Excel compatible)</SelectItem>
              <SelectItem value="pdf">PDF (Printable)</SelectItem>
              <SelectItem value="json">JSON (Data export)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Date Range Info */}
        <div className="rounded-lg bg-muted p-3">
          <div className="text-sm font-medium">Date Range</div>
          <div className="text-sm text-muted-foreground">
            {dateRange.from.toLocaleDateString()} - {dateRange.to.toLocaleDateString()}
          </div>
        </div>

        {/* Export Button */}
        <Button 
          onClick={handleExport} 
          disabled={isExporting}
          className="w-full"
        >
          {isExporting ? (
            <>
              <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
              Exporting...
            </>
          ) : (
            <>
              <Download className="mr-2 h-4 w-4" />
              Export {selectedReport?.label}
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  )
} 