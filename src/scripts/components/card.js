import { changeLikeCardStatus } from './api.js';

export const likeCard = (likeButton, currentCardId) => {
  const targetCard = likeButton.closest('.card');
  const counterElement = targetCard.querySelector('.card__like-count');
  const hasMyLike = likeButton.classList.contains('card__like-button_is-active');

  changeLikeCardStatus(currentCardId, hasMyLike)
    .then((serverCardData) => {
      likeButton.classList.toggle('card__like-button_is-active', !hasMyLike);
      if (counterElement) {
        counterElement.textContent = serverCardData.likes.length;
      }
    })
    .catch((err) => {
      console.log(`Ошибка при обработке лайка: ${err}`);
    });
};

export const deleteCard = (cardElement) => {
  cardElement.remove();
};

const getCardTemplate = () => {
  return document
    .querySelector("#card-template")
    .content.querySelector(".card")
    .cloneNode(true);
};

export const createCardElement = (cardData, eventCallbacks, currentUserId) => {
  const { onPreviewPicture, onLikeIcon, onDeleteCard } = eventCallbacks;
  const element = getCardTemplate();
  
  const buttonLike = element.querySelector(".card__like-button");
  const buttonDelete = element.querySelector(".card__control-button_type_delete");
  const imageElement = element.querySelector(".card__image");
  const totalLikesElement = element.querySelector(".card__like-count");
  const titleElement = element.querySelector(".card__title");

  imageElement.src = cardData.link;
  imageElement.alt = cardData.name;
  titleElement.textContent = cardData.name;

  if (totalLikesElement) {
    totalLikesElement.textContent = cardData.likes.length;
  }

  const isLikedByCurrentUser = cardData.likes.some((user) => user._id === currentUserId);
  if (isLikedByCurrentUser) {
    buttonLike.classList.add("card__like-button_is-active");
  }

  if (onLikeIcon) {
    buttonLike.addEventListener("click", () => onLikeIcon(buttonLike, cardData._id));
  }

  const isCardOwner = cardData.owner && cardData.owner._id === currentUserId;
  if (onDeleteCard && isCardOwner) {
    buttonDelete.addEventListener("click", () => onDeleteCard(element, cardData._id));
  } else {
    buttonDelete.remove();
  }

  if (onPreviewPicture) {
    imageElement.addEventListener("click", () => onPreviewPicture({ name: cardData.name, link: cardData.link }));
  }

  return element;
};