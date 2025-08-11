export interface PatientInput {
  firstName: string;
  lastName: string;
  dateOfBirth: string; // YYYY-MM-DD
  phone: string;
  email: string;
  nic: string;
  adamHealthId?: string; // Adam Health ID
  address: {
    street: string;
    city: string;
    district: string;
    postalCode: string;
    country?: string;
  };
  gender: 'male' | 'female' | 'other';
}

export interface PhotoInput {
  contentType: string; // e.g., 'image/jpeg'
  dataBase64: string; // base64-encoded image string
  description?: string; // e.g., 'front', 'back', or descriptive label
  questionId?: string; // ID of the question this photo answers
  binaryId?: string; // ID of the created Binary resource
}

export interface QuestionnaireAnswer {
  linkId: string;
  text?: string; // Add question text property
  answer: Array<{
    valueString?: string;
    valueBoolean?: boolean;
    valueInteger?: number;
    valueDecimal?: number;
    valueDate?: string;
    valueDateTime?: string;
    valueCoding?: {
      system: string;
      code: string;
      display: string;
    };
    valueAttachment?: {
      contentType: string;
      url: string;
      data?: string; // For raw file data
    };
  }>;
}

export interface QuestionnaireInput {
  questionnaireId: string; // Questionnaire resource id
  answers: QuestionnaireAnswer[];
}

export interface AdamHealthResponse {
  success: boolean;
  patientId?: string;
  questionnaireResponseId?: string;
  binaryIds?: string[];
  error?: string;
  bundle?: any;
} 

// ============================================================================
// SCALABLE QUESTIONNAIRE CONFIGURATION
// ============================================================================

export interface QuestionOption {
  value: string;
  label: string;
}

export interface QuestionField {
  linkId: string;
  type: 'text' | 'number' | 'select' | 'multiselect' | 'radio' | 'checkbox' | 'textarea' | 'file';
  label: string;
  required: boolean;
  options?: QuestionOption[];
  conditional?: {
    field: string;
    value: string;
  };
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
  };
}

export interface QuestionnaireConfig {
  id: string;
  title: string;
  description: string;
  fhirQuestionnaireId: string;
  requiresPhotos: boolean;
  maxPhotos?: number;
  fields: QuestionField[];
  schema: any; // Zod schema for validation
}

export type AssessmentType = 'hair-loss' | 'erectile-dysfunction' | 'diabetes' | 'hypertension' | 'mental-health' | 'custom'; 