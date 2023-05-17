import Notiflix from 'notiflix';
import NewsApiService from './js/new-service.js';
import LoadMoreBtn from './js/loadMoreBtn.js';
import { refs } from './js/refs.js';

const newsApiService = new NewsApiService();
const loadMoreBtn = new LoadMoreBtn({
  selector: '.load-more',
  isHidden: true,
});

loadMoreBtn.button.addEventListener('click', onLoadMore);
refs.formEl.addEventListener('submit', onSubmit);

async function onSubmit(e) {
  e.preventDefault();
  refs.galleryEl.innerHTML = '';
  loadMoreBtn.hide();
  newsApiService.resetPage();
  newsApiService.query = e.currentTarget.elements.searchQuery.value.trim();
  if (newsApiService.query === '') {
    Notiflix.Notify.failure(
      'Sorry, there are no images matching your search query. Please try again.'
    );
    return;
  }
  try {
    const result = await newsApiService.fetchGallery();

    if (result.hits.length === 0) {
      Notiflix.Notify.failure(
        'Sorry, there are no images matching your search query. Please try again.'
      );
      return;
    } else {
      const markup = markupGallery(result.hits);
      updateMarkup(markup);
      if (result.hits.length < result.totalHits) {
        Notiflix.Notify.success(
          `Hooray! We found ${result.totalHits} images !!!`
        );
        loadMoreBtn.show();
      }
      if (result.hits.length >= result.totalHits) {
        Notiflix.Notify.success(
          `Hooray! We found ${result.totalHits} images !!!`
        );
        Notiflix.Notify.info(
          "We're sorry, but you've reached the end of search results."
        );
        return;
      }

      loadMoreBtn.show();
    }
  } catch (error) {
    console.log(error);
  }
}

async function onLoadMore() {
  try {
    loadMoreBtn.disable();
    const result = await newsApiService.fetchGallery();
    const markup = markupGallery(result.hits);
    if (result.hits.length >= result.totalHits) {
      Notiflix.Notify.info(
        "We're sorry, but you've reached the end of search results."
      );
      loadMoreBtn.hide();
      return;
    }
    if (result.hits === []) {
      Notiflix.Notify.info(
        "We're sorry, but you've reached the end of search results."
      );
      loadMoreBtn.hide();
      return;
    }
    updateMarkup(markup);
    loadMoreBtn.enable();
  } catch (error) {
    console.log(error);
  }
}

function markupGallery(hits) {
  return hits
    .map(
      hit => `
          <div class="photo-card">
            <img src="${hit.webformatURL}" alt="${hit.tags}" loading="lazy" />
            <div class="info">
              <p class="info-item">
                <b>Likes:</b> ${hit.likes}
              </p>
              <p class="info-item">
                <b>Views:</b> ${hit.views}
              </p>
              <p class="info-item">
                <b>Comments:</b> ${hit.comments}
              </p>
              <p class="info-item">
                <b>Downloads:</b> ${hit.downloads}
              </p>
            </div>
          </div>
        `
    )
    .join('');
}

function updateMarkup(markup) {
  refs.galleryEl.insertAdjacentHTML('beforeend', markup);
}
