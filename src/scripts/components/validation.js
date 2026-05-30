const showInputError = (formElement, inputElement, errorMessage, settings) => {
  const { inputErrorClass, errorClass } = settings;
  const errorElement = formElement.querySelector(`#${inputElement.id}-error`);
  
  errorElement.textContent = errorMessage;
  inputElement.classList.add(inputErrorClass);
  errorElement.classList.add(errorClass);
};

const hideInputError = (formElement, inputElement, settings) => {
  const { inputErrorClass, errorClass } = settings;
  const errorElement = formElement.querySelector(`#${inputElement.id}-error`);
  
  inputElement.classList.remove(inputErrorClass);
  errorElement.classList.remove(errorClass);
  errorElement.textContent = '';
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

const hasInvalidInput = (inputList) => {
  return inputList.some((input) => !input.validity.valid);
};

export const disableSubmitButton = (buttonElement, settings) => {
  buttonElement.disabled = true;
  buttonElement.classList.add(settings.inactiveButtonClass);
};

export const enableSubmitButton = (buttonElement, settings) => {
  buttonElement.classList.remove(settings.inactiveButtonClass);
  buttonElement.disabled = false;
};

const toggleButtonState = (inputList, buttonElement, settings) => {
  hasInvalidInput(inputList)
    ? disableSubmitButton(buttonElement, settings)
    : enableSubmitButton(buttonElement, settings);
};

const setEventListeners = (formElement, settings) => {
  const inputList = Array.from(formElement.querySelectorAll(settings.inputSelector));
  const buttonElement = formElement.querySelector(settings.submitButtonSelector);

  toggleButtonState(inputList, buttonElement, settings);

  inputList.forEach((input) => {
    input.addEventListener('input', () => {
      checkInputValidity(formElement, input, settings);
      toggleButtonState(inputList, buttonElement, settings);
    });
  });
};

export const clearValidation = (formElement, settings) => {
  const inputList = Array.from(formElement.querySelectorAll(settings.inputSelector));
  const buttonElement = formElement.querySelector(settings.submitButtonSelector);

  inputList.forEach((input) => hideInputError(formElement, input, settings));
  disableSubmitButton(buttonElement, settings);
};

export const enableValidation = (settings) => {
  const formList = Array.from(document.querySelectorAll(settings.formSelector));
  formList.forEach((form) => setEventListeners(form, settings));
};