import type { ReactNode } from "react";
import type { FieldErrors, UseFormRegisterReturn } from "react-hook-form";
import type { TextareaAutosizeProps } from "react-textarea-autosize";
import TextareaAutosize from "react-textarea-autosize";

/**
 * FieldWrapper
 */

type FieldWrapperProps = {
  label?: string;
  children: ReactNode;
};

export function FieldWrapper(props: FieldWrapperProps) {
  return (
    <div className="form-control">
      {props.label && (
        <label className="label">
          <span className="label-text">{props.label}</span>
        </label>
      )}
      {props.children}
    </div>
  );
}

/**
 * InputField
 */

type InputFieldProps = JSX.IntrinsicElements["input"] & {
  label?: string;
  register?: UseFormRegisterReturn;
};

export function InputField({ label, register, ...rest }: InputFieldProps) {
  return (
    <FieldWrapper label={label}>
      <input className="input input-bordered" {...rest} {...register} />
    </FieldWrapper>
  );
}

/**
 * TextareaAutosizeField
 */

type TextareaAutosizeFieldProps = TextareaAutosizeProps & {
  label?: string;
  register?: UseFormRegisterReturn;
};

export function TextareaAutosizeField({
  label,
  register,
  ...rest
}: TextareaAutosizeFieldProps) {
  return (
    <FieldWrapper label={label}>
      <TextareaAutosize
        className="textarea textarea-bordered"
        {...rest}
        {...register}
      />
    </FieldWrapper>
  );
}

/**
 * SelectField
 */

type SelectFieldProps = JSX.IntrinsicElements["select"] & {
  label?: string;
  register?: UseFormRegisterReturn;
};

export function SelectField({ label, register, ...rest }: SelectFieldProps) {
  return (
    <FieldWrapper label={label}>
      <select className="select select-bordered" {...rest} {...register} />
    </FieldWrapper>
  );
}

/**
 * FieldErrors
 */

export function getFieldErrorMessages(errors: FieldErrors): string {
  return Object.entries(errors).reduce((acc, cur) => {
    if (!cur[1]) return acc;
    const path = cur[0];
    const message = cur[1].message;
    return acc ? `${acc}\n${path}: ${message}` : `${path}: ${message}`;
  }, "");
}
