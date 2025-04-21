import { useState } from "react"
import { useRealEstateContract } from "./hooks/useRealEstateContract"
import { Button } from "./common/Button"
import { Input } from "./common/Input"
import { Textarea } from "./common/Textarea"
import { ErrorMessage } from "./common/ErrorMessage"
import { LoadingSpinner } from "./common/LoadingSpinner"

interface CreatePropertyFormProps {
  onClose: () => void
  onSuccess: () => void
}

export const CreatePropertyForm = ({ onClose, onSuccess }: CreatePropertyFormProps) => {
  const { mintProperty, isLoading, error } = useRealEstateContract()
  const [formData, setFormData] = useState({
    cadastralNumber: "",
    location: "",
    valuation: "",
    name: "",
    description: "",
    image: "",
  })
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({})

  const validateForm = () => {
    const errors: Record<string, string> = {}
    
    if (!formData.cadastralNumber) {
      errors.cadastralNumber = "Cadastral number is required"
    }
    if (!formData.location) {
      errors.location = "Location is required"
    }
    if (!formData.valuation) {
      errors.valuation = "Valuation is required"
    } else if (isNaN(Number(formData.valuation)) || Number(formData.valuation) <= 0) {
      errors.valuation = "Valuation must be a positive number"
    }
    if (!formData.name) {
      errors.name = "Property name is required"
    }
    if (!formData.description) {
      errors.description = "Description is required"
    }
    if (!formData.image) {
      errors.image = "Image URL is required"
    }

    setValidationErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    try {
      await mintProperty(formData, onSuccess)
    } catch (err) {
      console.error("Error creating property:", err)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    // Clear validation error when user starts typing
    if (validationErrors[name]) {
      setValidationErrors(prev => ({ ...prev, [name]: "" }))
    }
  }

  return (
    <div className="create-property-form">
      <h3>Create New Property</h3>
      
      {error && <ErrorMessage message={error} />}

      <form onSubmit={handleSubmit}>
        <Input
          label="Cadastral Number"
          name="cadastralNumber"
          value={formData.cadastralNumber}
          onChange={handleChange}
          error={validationErrors.cadastralNumber}
        />

        <Input
          label="Location"
          name="location"
          value={formData.location}
          onChange={handleChange}
          error={validationErrors.location}
        />

        <Input
          label="Valuation (ETH)"
          name="valuation"
          type="number"
          value={formData.valuation}
          onChange={handleChange}
          error={validationErrors.valuation}
        />

        <Input
          label="Property Name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          error={validationErrors.name}
        />

        <Textarea
          label="Description"
          name="description"
          value={formData.description}
          onChange={handleChange}
          error={validationErrors.description}
        />

        <Input
          label="Image URL"
          name="image"
          value={formData.image}
          onChange={handleChange}
          error={validationErrors.image}
        />

        <div className="form-actions">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? <LoadingSpinner /> : "Create Property"}
          </Button>
        </div>
      </form>
    </div>
  )
} 