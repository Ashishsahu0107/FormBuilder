import { useState, useMemo, useEffect } from "react";
import type {
  FormSchema,
  FormSection,
  FormField,
  Condition,
} from "../types/schema";
import { FieldRenderer } from "./fields/FieldRenderer";
import { Button } from "@/components/ui/button";

interface FormRendererProps {
  schema: FormSchema;
  mode?: "preview" | "public" | "canvas";
  onSubmit?: (values: Record<string, unknown>) => void;
}

function evaluateCondition(
  cond: Condition,
  values: Record<string, unknown>,
): boolean {
  const val = values[cond.fieldId];
  switch (cond.operator) {
    case "equals":
      return val === cond.value;
    case "not_equals":
      return val !== cond.value;
    case "contains":
      return Array.isArray(val)
        ? val.includes(cond.value)
        : String(val || "").includes(String(cond.value));
    case "not_contains":
      return Array.isArray(val)
        ? !val.includes(cond.value)
        : !String(val || "").includes(String(cond.value));
    case "is_empty":
      return (
        val === undefined ||
        val === null ||
        val === "" ||
        (Array.isArray(val) && val.length === 0)
      );
    case "is_not_empty":
      return (
        val !== undefined &&
        val !== null &&
        val !== "" &&
        !(Array.isArray(val) && val.length === 0)
      );
    case "greater_than":
      return Number(val) > Number(cond.value);
    case "less_than":
      return Number(val) < Number(cond.value);
    default:
      return false;
  }
}

export function FormRenderer({
  schema,
  mode = "public",
  onSubmit,
}: FormRendererProps) {
  const [values, setValues] = useState<Record<string, unknown>>(() => {
    if (mode === "public" && schema.id) {
      const saved = localStorage.getItem("form-draft-" + schema.id);
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch {}
      }
    }
    return {};
  });

  useEffect(() => {
    if (mode === "public" && schema.id && Object.keys(values).length > 0) {
      localStorage.setItem("form-draft-" + schema.id, JSON.stringify(values));
    }
  }, [values, mode, schema.id]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  const isMultiStep =
    schema.settings?.isMultiStep &&
    schema.sections.length > 1 &&
    mode !== "canvas";

  // Evaluate Logic Rules
  const fieldOverrides = useMemo(() => {
    const overrides: Record<
      string,
      {
        hidden?: boolean;
        disabled?: boolean;
        required?: boolean;
        value?: unknown;
      }
    > = {};

    if (!schema.logic) return overrides;

    for (const rule of schema.logic) {
      const conditionResults = rule.conditions.map((cond) =>
        evaluateCondition(cond, values),
      );
      const isMatch =
        rule.conditionOperator === "ANY"
          ? conditionResults.some((r) => r)
          : conditionResults.every((r) => r);

      if (isMatch) {
        for (const action of rule.actions) {
          if (!overrides[action.fieldId]) overrides[action.fieldId] = {};
          const target = overrides[action.fieldId];
          if (action.type === "SHOW") target.hidden = false;
          if (action.type === "HIDE") target.hidden = true;
          if (action.type === "ENABLE") target.disabled = false;
          if (action.type === "DISABLE") target.disabled = true;
          if (action.type === "REQUIRE") target.required = true;
          if (action.type === "SET_VALUE" && action.value !== undefined)
            target.value = action.value;
        }
      }
    }
    return overrides;
  }, [schema.logic, values]);

  const handleFieldChange = (fieldId: string, value: unknown) => {
    setValues((prev) => ({ ...prev, [fieldId]: value }));
    if (errors[fieldId])
      setErrors((prev) => {
        const n = { ...prev };
        delete n[fieldId];
        return n;
      });
  };

  const validateSection = (section: FormSection): boolean => {
    const newErrors: Record<string, string> = {};
    for (const field of section.fields) {
      const finalHidden = fieldOverrides[field.id]?.hidden ?? field.hidden;
      const finalRequired =
        fieldOverrides[field.id]?.required ?? field.required;
      if (
        !finalHidden &&
        finalRequired &&
        (values[field.id] === undefined ||
          values[field.id] === "" ||
          (Array.isArray(values[field.id]) &&
            (values[field.id] as any[]).length === 0))
      ) {
        newErrors[field.id] = `${field.label} is required`;
      }
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateForm = (): boolean => {
    let isValid = true;
    for (const section of schema.sections) {
      if (!validateSection(section)) isValid = false;
    }
    return isValid;
  };

  const handleNext = () => {
    if (validateSection(schema.sections[currentStep])) {
      setCurrentStep((p) => Math.min(p + 1, schema.sections.length - 1));
    }
  };

  const handlePrev = () => {
    setCurrentStep((p) => Math.max(p - 1, 0));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (mode === "canvas") return;
    if (isMultiStep && !validateSection(schema.sections[currentStep])) return;
    if (!isMultiStep && !validateForm()) return;

    // Inject SET_VALUE overrides before submission
    const finalValues = { ...values };
    Object.keys(fieldOverrides).forEach((fieldId) => {
      if (fieldOverrides[fieldId].value !== undefined) {
        finalValues[fieldId] = fieldOverrides[fieldId].value;
      }
    });

    setIsSubmitting(true);
    try {
      await onSubmit?.(finalValues);
      setSubmitted(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="text-center py-16">
        <div className="text-5xl mb-4">ÃƒÂ¢Ã…â€œÃ¢â‚¬Â¦</div>
        <h2 className="text-2xl font-semibold mb-2">Thank you!</h2>
        <p className="text-gray-500">
          {schema.settings?.successMessage ||
            "Your submission has been received."}
        </p>
      </div>
    );
  }

  const activeSections = isMultiStep
    ? [schema.sections[currentStep]]
    : schema.sections;

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {schema.title && mode !== "canvas" && (
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">{schema.title}</h1>
          {schema.description && (
            <p className="mt-2 text-gray-500">{schema.description}</p>
          )}
        </div>
      )}

      {isMultiStep && (
        <div className="mb-8">
          <div className="flex items-center justify-between text-sm font-medium text-gray-500 mb-2">
            <span>
              Step {currentStep + 1} of {schema.sections.length}
            </span>
            <span>
              {Math.round(((currentStep + 1) / schema.sections.length) * 100)}%
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{
                width: `${((currentStep + 1) / schema.sections.length) * 100}%`,
              }}
            ></div>
          </div>
        </div>
      )}

      {activeSections.map((section) => (
        <SectionRenderer
          key={section.id}
          section={section}
          values={values}
          errors={errors}
          onChange={handleFieldChange}
          mode={mode}
          fieldOverrides={fieldOverrides}
        />
      ))}

      {mode !== "canvas" && (
        <div className="flex items-center justify-between pt-6 border-t border-gray-100">
          {isMultiStep ? (
            <>
              <Button
                type="button"
                variant="outline"
                onClick={handlePrev}
                disabled={currentStep === 0 || isSubmitting}
              >
                Previous
              </Button>
              {currentStep === schema.sections.length - 1 ? (
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {isSubmitting
                    ? "Submitting..."
                    : schema.settings?.submitButtonText || "Submit"}
                </Button>
              ) : (
                <Button
                  type="button"
                  onClick={handleNext}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  Next Step
                </Button>
              )}
            </>
          ) : (
            <div className="w-full">
              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-blue-600 hover:bg-blue-700 text-lg py-6"
              >
                {isSubmitting
                  ? "Submitting..."
                  : schema.settings?.submitButtonText || "Submit"}
              </Button>
            </div>
          )}
        </div>
      )}
    </form>
  );
}

function SectionRenderer({
  section,
  values,
  errors,
  onChange,
  mode,
  fieldOverrides,
}: {
  section: FormSection;
  values: Record<string, unknown>;
  errors: Record<string, string>;
  onChange: (fieldId: string, value: unknown) => void;
  mode: "preview" | "public" | "canvas";
  fieldOverrides: Record<string, any>;
}) {
  return (
    <div className="space-y-6">
      {section.title && (
        <div className="border-b border-gray-200 pb-2">
          <h3 className="text-xl font-semibold text-gray-800">
            {section.title}
          </h3>
          {section.description && (
            <p className="text-sm text-gray-500 mt-1">{section.description}</p>
          )}
        </div>
      )}
      <div
        className={`grid gap-6 ${section.columns === 2 ? "grid-cols-2" : section.columns === 3 ? "grid-cols-3" : "grid-cols-1"}`}
      >
        {section.fields.map((field) => {
          const overrides = fieldOverrides[field.id] || {};
          const finalHidden = overrides.hidden ?? field.hidden;
          if (finalHidden && mode !== "canvas") return null;

          const fieldProps = {
            ...field,
            disabled: overrides.disabled ?? field.disabled,
            required: overrides.required ?? field.required,
            hidden: finalHidden,
          };

          const val =
            overrides.value !== undefined ? overrides.value : values[field.id];

          return (
            <div
              key={field.id}
              className={
                field.layout?.width === "half"
                  ? "col-span-1"
                  : field.layout?.width === "third"
                    ? "col-span-1"
                    : "col-span-full"
              }
            >
              <FieldRenderer
                field={fieldProps as FormField}
                value={val}
                onChange={(v) => onChange(field.id, v)}
                error={errors[field.id]}
                mode={mode}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
