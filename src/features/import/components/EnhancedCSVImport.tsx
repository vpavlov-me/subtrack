import { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { Upload, FileText, CheckCircle, AlertCircle, X, Eye, EyeOff } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { parseCSV } from '@/lib/csv'
import { toast } from 'sonner'

interface CSVRow {
  [key: string]: string
}

interface FieldMapping {
  name: string
  price: string
  category: string
  billingCycle: string
  nextBillingDate: string
  description: string
}

interface ValidationError {
  row: number
  field: string
  message: string
}

const REQUIRED_FIELDS = ['name', 'price']
const FIELD_OPTIONS = [
  { value: 'name', label: 'Subscription Name' },
  { value: 'price', label: 'Price' },
  { value: 'category', label: 'Category' },
  { value: 'billingCycle', label: 'Billing Cycle' },
  { value: 'nextBillingDate', label: 'Next Billing Date' },
  { value: 'description', label: 'Description' }
]

export function EnhancedCSVImport() {
  const [csvData, setCsvData] = useState<CSVRow[]>([])
  const [headers, setHeaders] = useState<string[]>([])
  const [fieldMapping, setFieldMapping] = useState<FieldMapping>({
    name: '',
    price: '',
    category: '',
    billingCycle: '',
    nextBillingDate: '',
    description: ''
  })
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>([])
  const [showPreview, setShowPreview] = useState(false)
  const [autoMap, setAutoMap] = useState(true)
  const [isImporting, setIsImporting] = useState(false)

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0]
    if (!file) return

    try {
      const text = await file.text()
      const { data, headers: csvHeaders } = parseCSV(text)
      
      setCsvData(data)
      setHeaders(csvHeaders)
      
      if (autoMap) {
        // Auto-map fields based on common patterns
        const autoMapping: Partial<FieldMapping> = {}
        csvHeaders.forEach((header: string) => {
          const lowerHeader = header.toLowerCase()
          if (lowerHeader.includes('name') || lowerHeader.includes('service')) {
            autoMapping.name = header
          } else if (lowerHeader.includes('price') || lowerHeader.includes('cost') || lowerHeader.includes('amount')) {
            autoMapping.price = header
          } else if (lowerHeader.includes('category') || lowerHeader.includes('type')) {
            autoMapping.category = header
          } else if (lowerHeader.includes('cycle') || lowerHeader.includes('billing')) {
            autoMapping.billingCycle = header
          } else if (lowerHeader.includes('date') || lowerHeader.includes('next')) {
            autoMapping.nextBillingDate = header
          } else if (lowerHeader.includes('description') || lowerHeader.includes('notes')) {
            autoMapping.description = header
          }
        })
        setFieldMapping(prev => ({ ...prev, ...autoMapping }))
      }
      
      toast.success(`CSV file loaded with ${data.length} rows`)
    } catch (error) {
      toast.error('Failed to parse CSV file')
      console.error('CSV parsing error:', error)
    }
  }, [autoMap])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/csv': ['.csv'],
      'application/vnd.ms-excel': ['.csv']
    },
    multiple: false
  })

  const validateData = () => {
    const errors: ValidationError[] = []
    
    csvData.forEach((row, index) => {
      // Check required fields
      REQUIRED_FIELDS.forEach(field => {
        const mappedField = fieldMapping[field as keyof FieldMapping]
        if (!mappedField || !row[mappedField]?.trim()) {
          errors.push({
            row: index + 1,
            field,
            message: `${field} is required`
          })
        }
      })
      
      // Validate price format
      if (fieldMapping.price && row[fieldMapping.price]) {
        const price = parseFloat(row[fieldMapping.price])
        if (isNaN(price) || price < 0) {
          errors.push({
            row: index + 1,
            field: 'price',
            message: 'Price must be a valid positive number'
          })
        }
      }
      
      // Validate date format
      if (fieldMapping.nextBillingDate && row[fieldMapping.nextBillingDate]) {
        const date = new Date(row[fieldMapping.nextBillingDate])
        if (isNaN(date.getTime())) {
          errors.push({
            row: index + 1,
            field: 'nextBillingDate',
            message: 'Invalid date format'
          })
        }
      }
    })
    
    setValidationErrors(errors)
    return errors.length === 0
  }

  const handleImport = async () => {
    if (!validateData()) {
      toast.error(`Found ${validationErrors.length} validation errors`)
      return
    }

    setIsImporting(true)
    try {
      // Simulate import process
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      const importedCount = csvData.length
      toast.success(`Successfully imported ${importedCount} subscriptions`)
      
      // Reset form
      setCsvData([])
      setHeaders([])
      setFieldMapping({
        name: '',
        price: '',
        category: '',
        billingCycle: '',
        nextBillingDate: '',
        description: ''
      })
      setValidationErrors([])
    } catch (error) {
      toast.error('Failed to import subscriptions')
    } finally {
      setIsImporting(false)
    }
  }

  const getFieldMappingValue = (field: keyof FieldMapping) => {
    return fieldMapping[field] || ''
  }

  const setFieldMappingValue = (field: keyof FieldMapping, value: string) => {
    setFieldMapping(prev => ({ ...prev, [field]: value }))
  }

  return (
    <div className="space-y-6">
      {/* File Upload */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Upload CSV File
          </CardTitle>
          <CardDescription>
            Import your subscriptions from a CSV file. We'll help you map the columns correctly.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
              isDragActive 
                ? 'border-primary bg-primary/5' 
                : 'border-gray-300 hover:border-primary/50'
            }`}
          >
            <input {...getInputProps()} />
            <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            {isDragActive ? (
              <p className="text-lg font-medium">Drop the CSV file here...</p>
            ) : (
              <div>
                <p className="text-lg font-medium mb-2">Drag & drop a CSV file here</p>
                <p className="text-sm text-gray-500">or click to browse</p>
              </div>
            )}
          </div>
          
          {csvData.length > 0 && (
            <div className="mt-4 flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span className="text-sm text-green-600">
                {csvData.length} rows loaded successfully
              </span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Field Mapping */}
      {headers.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Map CSV Columns</CardTitle>
            <CardDescription>
              Tell us which columns correspond to which subscription fields
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-2">
              <Switch
                id="auto-map"
                checked={autoMap}
                onCheckedChange={setAutoMap}
              />
              <Label htmlFor="auto-map">Auto-detect field mappings</Label>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {FIELD_OPTIONS.map((field) => (
                <div key={field.value} className="space-y-2">
                  <Label htmlFor={field.value}>{field.label}</Label>
                  <Select
                    value={getFieldMappingValue(field.value as keyof FieldMapping)}
                    onValueChange={(value) => setFieldMappingValue(field.value as keyof FieldMapping, value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select column" />
                    </SelectTrigger>
                    <SelectContent>
                      {headers.map((header) => (
                        <SelectItem key={header} value={header}>
                          {header}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {REQUIRED_FIELDS.includes(field.value) && (
                    <Badge variant="secondary" className="text-xs">Required</Badge>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Validation Errors */}
      {validationErrors.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-600">
              <AlertCircle className="h-5 w-5" />
              Validation Errors ({validationErrors.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {validationErrors.map((error, index) => (
                <div key={index} className="flex items-center gap-2 text-sm text-red-600">
                  <X className="h-4 w-4" />
                  <span>Row {error.row}: {error.field} - {error.message}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Data Preview */}
      {csvData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Data Preview
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowPreview(!showPreview)}
              >
                {showPreview ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                {showPreview ? 'Hide' : 'Show'} Preview
              </Button>
            </CardTitle>
          </CardHeader>
          {showPreview && (
            <CardContent>
              <div className="max-h-64 overflow-y-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      {headers.map((header) => (
                        <TableHead key={header}>{header}</TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {csvData.slice(0, 5).map((row, index) => (
                      <TableRow key={index}>
                        {headers.map((header) => (
                          <TableCell key={header}>{row[header] || '-'}</TableCell>
                        ))}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                {csvData.length > 5 && (
                  <div className="text-center text-sm text-gray-500 mt-2">
                    Showing first 5 rows of {csvData.length} total rows
                  </div>
                )}
              </div>
            </CardContent>
          )}
        </Card>
      )}

      {/* Import Button */}
      {csvData.length > 0 && (
        <div className="flex justify-end">
          <Button
            onClick={handleImport}
            disabled={isImporting || validationErrors.length > 0}
            className="min-w-[120px]"
          >
            {isImporting ? (
              <>
                <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                Importing...
              </>
            ) : (
              <>
                <Upload className="mr-2 h-4 w-4" />
                Import {csvData.length} Subscriptions
              </>
            )}
          </Button>
        </div>
      )}
    </div>
  )
} 