const apiConfig = {
  baseUrl: "https://mesto.nomoreparties.co/v1/apf-cohort-203",
  headers: {
    authorization: "4726fbd5-3a16-4219-89cd-654670355e8f",
    "Content-Type": "application/json",
  },
};

const checkResponseStatus = (response) => {
  if (response.ok) {
    return response.json();
  }
  return Promise.reject(`Ошибка запроса: ${response.status}`);
};

export const getUserInfo = () => {
  return fetch(`${apiConfig.baseUrl}/users/me`, {
    headers: apiConfig.headers,
  }).then(checkResponseStatus);
};

export const getCardList = () => {
  return fetch(`${apiConfig.baseUrl}/cards`, {
    headers: apiConfig.headers,
  }).then(checkResponseStatus);
};

export const setUserInfo = ({ name, about }) => {
  return fetch(`${apiConfig.baseUrl}/users/me`, {
    method: "PATCH",
    headers: apiConfig.headers,
    body: JSON.stringify({ name, about }),
  }).then(checkResponseStatus);
};

export const setAvatar = ({ avatar }) => {
  return fetch(`${apiConfig.baseUrl}/users/me/avatar`, {
    method: "PATCH",
    headers: apiConfig.headers,
    body: JSON.stringify({ avatar }),
  }).then(checkResponseStatus);
};

export const addNewCard = ({ name, link }) => {
  return fetch(`${apiConfig.baseUrl}/cards`, {
    method: "POST",
    headers: apiConfig.headers,
    body: JSON.stringify({ name, link }),
  }).then(checkResponseStatus);
};

export const removeCardFromServer = (targetCardId) => {
  return fetch(`${apiConfig.baseUrl}/cards/${targetCardId}`, {
    method: "DELETE",
    headers: apiConfig.headers,
  }).then(checkResponseStatus);
};

export const changeLikeCardStatus = (targetCardId, isAlreadyLiked) => {
  return fetch(`${apiConfig.baseUrl}/cards/likes/${targetCardId}`, {
    method: isAlreadyLiked ? "DELETE" : "PUT",
    headers: apiConfig.headers,
  }).then(checkResponseStatus);
};