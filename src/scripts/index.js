/*
  Файл index.js является точкой входа в наше приложение
  и только он должен содержать логику инициализации нашего приложения
  используя при этом импорты из других файлов

  Из index.js не допускается что то экспортировать
*/

import { getCardList, getUserInfo, setUserInfo, setAvatar, addNewCard, removeCardFromServer } from "./components/api.js";
import { createCardElement, deleteCard, likeCard } from "./components/card.js";
import { openModalWindow, closeModalWindow, setCloseModalWindowEventListeners } from "./components/modal.js";
import { enableValidation, clearValidation } from "./components/validation.js";

// Объект настроек валидации
const validationSettings = {
  formSelector: ".popup__form",
  inputSelector: ".popup__input",
  submitButtonSelector: ".popup__button",
  inactiveButtonClass: "popup__button_disabled",
  inputErrorClass: "popup__input_type_error",
  errorClass: "popup__error_visible",
};

// Активация валидации
enableValidation(validationSettings);

// DOM узлы
const placesWrap = document.querySelector(".places__list");
const profileFormModalWindow = document.querySelector(".popup_type_edit");
const profileForm = profileFormModalWindow.querySelector(".popup__form");
const profileTitleInput = profileForm.querySelector(".popup__input_type_name");
const profileDescriptionInput = profileForm.querySelector(".popup__input_type_description");

const cardFormModalWindow = document.querySelector(".popup_type_new-card");
const cardForm = cardFormModalWindow.querySelector(".popup__form");
const cardNameInput = cardForm.querySelector(".popup__input_type_card-name");
const cardLinkInput = cardForm.querySelector(".popup__input_type_url");

const imageModalWindow = document.querySelector(".popup_type_image");
const imageElement = imageModalWindow.querySelector(".popup__image");
const imageCaption = imageModalWindow.querySelector(".popup__caption");

const openProfileFormButton = document.querySelector(".profile__edit-button");
const openCardFormButton = document.querySelector(".profile__add-button");

const profileTitle = document.querySelector(".profile__title");
const profileDescription = document.querySelector(".profile__description");
const profileAvatar = document.querySelector(".profile__image");

const avatarFormModalWindow = document.querySelector(".popup_type_edit-avatar");
const avatarForm = avatarFormModalWindow.querySelector(".popup__form");
const avatarInput = avatarForm.querySelector(".popup__input");

const removeCardModalWindow = document.querySelector(".popup_type_remove-card");
const removeCardForm = removeCardModalWindow.querySelector(".popup__form");

const logo = document.querySelector('.header__logo');

// Глобальные переменные состояния
let currentUserId = null;
let currentCardToDelete = null; 

// Утилита для изменения текста кнопки при загрузке (UX)
const renderLoading = (isLoading, formElement, text = "Сохранение...", defaultText = "Сохранить") => {
  const submitButton = formElement.querySelector('.popup__button');
  if (isLoading) {
    submitButton.textContent = text;
    submitButton.disabled = true;
  } else {
    submitButton.textContent = defaultText;
    submitButton.disabled = false;
  }
};

const handlePreviewPicture = ({ name, link }) => {
  imageElement.src = link;
  imageElement.alt = name;
  imageCaption.textContent = name;
  openModalWindow(imageModalWindow);
};

const handleProfileFormSubmit = (evt) => {
  evt.preventDefault();
  renderLoading(true, profileForm, "Сохранение...");

  setUserInfo({
    name: profileTitleInput.value,
    about: profileDescriptionInput.value,
  })
    .then((userData) => {
      profileTitle.textContent = userData.name;
      profileDescription.textContent = userData.about;
      closeModalWindow(profileFormModalWindow);
    })
    .catch((err) => console.log(`Ошибка обновления профиля: ${err}`))
    .finally(() => renderLoading(false, profileForm, "Сохранение...", "Сохранить"));
};

const handleAvatarFromSubmit = (evt) => {
  evt.preventDefault();
  renderLoading(true, avatarForm, "Сохранение...");

  setAvatar({ avatar: avatarInput.value })
    .then((userData) => {
      profileAvatar.style.backgroundImage = `url(${userData.avatar})`;
      closeModalWindow(avatarFormModalWindow);
    })
    .catch((err) => console.log(`Ошибка обновления аватара: ${err}`))
    .finally(() => renderLoading(false, avatarForm, "Сохранение...", "Сохранить"));
};

const handleCardFormSubmit = (evt) => {
  evt.preventDefault();
  renderLoading(true, cardForm, "Создание...");

  addNewCard({
    name: cardNameInput.value,
    link: cardLinkInput.value,
  })
    .then((newCardData) => {
      const cardElement = createCardElement(
        newCardData,
        {
          onPreviewPicture: handlePreviewPicture,
          onLikeIcon: likeCard,
          onDeleteCard: (element, id) => {
            currentCardToDelete = { element, cardId: id };
            openModalWindow(removeCardModalWindow);
          },
        },
        currentUserId
      );
      placesWrap.prepend(cardElement);
      closeModalWindow(cardFormModalWindow);
    })
    .catch((err) => console.log(`Ошибка добавления карточки: ${err}`))
    .finally(() => renderLoading(false, cardForm, "Создание...", "Создать"));
};

const handleRemoveCardSubmit = (evt) => {
  evt.preventDefault();
  if (!currentCardToDelete) return;

  renderLoading(true, removeCardForm, "Удаление...");

  removeCardFromServer(currentCardToDelete.cardId)
    .then(() => {
      deleteCard(currentCardToDelete.element);
      closeModalWindow(removeCardModalWindow);
      currentCardToDelete = null;
    })
    .catch((err) => console.log(`Ошибка удаления карточки: ${err}`))
    .finally(() => renderLoading(false, removeCardForm, "Удаление...", "Да"));
};

// EventListeners
profileForm.addEventListener("submit", handleProfileFormSubmit);
cardForm.addEventListener("submit", handleCardFormSubmit);
avatarForm.addEventListener("submit", handleAvatarFromSubmit);
removeCardForm.addEventListener("submit", handleRemoveCardSubmit);

openProfileFormButton.addEventListener("click", () => {
  profileTitleInput.value = profileTitle.textContent;
  profileDescriptionInput.value = profileDescription.textContent;
  clearValidation(profileForm, validationSettings);
  openModalWindow(profileFormModalWindow);
});

profileAvatar.addEventListener("click", () => {
  avatarForm.reset();
  clearValidation(avatarForm, validationSettings);
  openModalWindow(avatarFormModalWindow);
});

openCardFormButton.addEventListener("click", () => {
  cardForm.reset();
  clearValidation(cardForm, validationSettings);
  openModalWindow(cardFormModalWindow);
});

// Утилита для красивого форматирования дат в аналитике
const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('ru-RU', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

// Обработка клика на логотип (Вывод статистики/Аналитика)
const handleLogoClick = () => {
  getCardList()
    .then((cards) => {
      const statsModal = document.querySelector('.popup_type_info');
      const infoList = statsModal.querySelector('.popup__info');
      const userList = statsModal.querySelector('.popup__list');

      infoList.innerHTML = '';
      userList.innerHTML = '';

      statsModal.querySelector('.popup__title').textContent = 'Статистика пользователей';
      statsModal.querySelector('.popup__text').textContent = 'Все пользователи'; 

      const userCardCounts = new Map(); 

      cards.forEach(card => {
        if (card.owner?._id) {
          const userId = card.owner._id;
          const currentCount = userCardCounts.get(userId) || 0;
          userCardCounts.set(userId, currentCount + 1);
        }
      });

      const createInfoItem = (term, description) => {
        const template = document.getElementById('popup-info-definition-template').content.cloneNode(true);
        template.querySelector('.popup__info-term').textContent = term;
        template.querySelector('.popup__info-description').textContent = description;
        return template;
      };

      const createUserBadge = (name) => {
        const template = document.getElementById('popup-info-user-preview-template').content.cloneNode(true);
        template.querySelector('.popup__list-item').textContent = name;
        return template;
      };

      infoList.append(createInfoItem('Всего карточек:', cards.length));

      if (cards.length > 0) {
        const firstCard = cards[cards.length - 1]; 
        const lastCard = cards[0]; 
        infoList.append(createInfoItem('Первая создана:', formatDate(firstCard.createdAt)));
        infoList.append(createInfoItem('Последняя создана:', formatDate(lastCard.createdAt)));
      }

      infoList.append(createInfoItem('Всего пользователей:', userCardCounts.size));

      let maxCardsFromOneUser = 0;
      if (userCardCounts.size > 0) {
        maxCardsFromOneUser = Math.max(...Array.from(userCardCounts.values()));
      }
      infoList.append(createInfoItem('Максимум карточек от одного:', maxCardsFromOneUser)); 

      userCardCounts.forEach((count, userId) => {
        const userName = cards.find(card => card.owner?._id === userId)?.owner?.name || 'Неизвестный';
        userList.append(createUserBadge(userName));
      });

      openModalWindow(statsModal);
    })
    .catch((err) => console.log(`Ошибка загрузки аналитики: ${err}`));
};

if (logo) {
  logo.addEventListener('click', handleLogoClick);
}

// Одновременное получение данных пользователя и карточек с сервера
Promise.all([getCardList(), getUserInfo()])
  .then(([cards, userData]) => {
    currentUserId = userData._id; 

    profileTitle.textContent = userData.name;
    profileDescription.textContent = userData.about;
    profileAvatar.style.backgroundImage = `url(${userData.avatar})`;

    placesWrap.innerHTML = '';

    cards.forEach((cardData) => {
      const cardElement = createCardElement(
        cardData,
        {
          onPreviewPicture: handlePreviewPicture,
          onLikeIcon: likeCard,
          onDeleteCard: (element, id) => {
            currentCardToDelete = { element, cardId: id };
            openModalWindow(removeCardModalWindow);
          },
        },
        currentUserId
      );
      placesWrap.append(cardElement);
    });
  })
  .catch((err) => console.log(`Критическая ошибка инициализации данных: ${err}`));

// Настраиваем обработчики закрытия попапов
const allPopups = document.querySelectorAll(".popup");
allPopups.forEach((popup) => {
  setCloseModalWindowEventListeners(popup);
});