const showInputError = (formElement, inputElement, errorMessage, settings) => {
  const { inputErrorClass, errorClass } = settings;
  const errorElement = formElement.querySelector(`#${inputElement.id}-error`);
  
  errorElement.textContent = errorMessage;
  inputElement.classList.add(inputErrorClass);
  errorElement.classList.add(errorClass);

  disableSubmitButton(formElement, settings);
};

const hideInputError = (formElement, inputElement, settings) => {
  const { inputErrorClass, errorClass } = settings;
  const errorElement = formElement.querySelector(`#${inputElement.id}-error`);
  
  inputElement.classList.remove(inputErrorClass);
  errorElement.classList.remove(errorClass);
  errorElement.textContent = '';

  enableSubmitButton(formElement, settings);
};

const checkInputValidity = (formElement, inputElement, settings) => {
  if (inputElement.validity.valid) {
    hideInputError(formElement, inputElement, settings);
  } else {
    const { patternMismatch } = inputElement.validity;
    const message = patternMismatch ? inputElement.dataset.errorMessage : inputElement.validationMessage;
    showInputError(formElement, inputElement, message, settings);
  }
};

const hasInvalidInput = (formElement, settings) => {
  const inputList = [...formElement.querySelectorAll(settings.inputSelector)];
  return inputList.some((input) => !input.validity.valid);
};

const disableSubmitButton = (formElement, settings) => {
  const submitBtn = formElement.querySelector(settings.submitButtonSelector);
  submitBtn.disabled = true;
  submitBtn.classList.add(settings.inactiveButtonClass);
};

const enableSubmitButton = (formElement, settings) => {
  const submitBtn = formElement.querySelector(settings.submitButtonSelector);
  submitBtn.classList.remove(settings.inactiveButtonClass);
  submitBtn.disabled = false;
};

const toggleButtonState = (formElement, settings) => {
  hasInvalidInput(formElement, settings)
    ? disableSubmitButton(formElement, settings)
    : enableSubmitButton(formElement, settings);
};

const setEventListeners = (formElement, settings) => {
  const inputList = [...formElement.querySelectorAll(settings.inputSelector)];
  inputList.forEach((input) => {
    input.addEventListener('input', () => {
      checkInputValidity(formElement, input, settings);
      toggleButtonState(formElement, settings);
    });
  });
};

export const clearValidation = (formElement, settings) => {
  const inputList = [...formElement.querySelectorAll(settings.inputSelector)];
  inputList.forEach((input) => hideInputError(formElement, input, settings));
  toggleButtonState(formElement, settings);
};

export const enableValidation = (settings) => {
  const formList = [...document.querySelectorAll(settings.formSelector)];
  formList.forEach((form) => setEventListeners(form, settings));
};