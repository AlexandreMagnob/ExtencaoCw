let scrapedData = [];

function sleep(ms) { return new Promise(resolve => setTimeout(resolve, ms)); }

async function clickProductCards() {
  await sleep(500)
  let categoryDivs = document.querySelectorAll('.category-container[data-v-c24acdb4]');

  for await (const categoryIndex of [...Array(categoryDivs.length).keys()]) {
    await sleep(500)
    let categoryDivs = document.querySelectorAll('.category-container[data-v-c24acdb4]');
    let categoryDiv = categoryDivs[categoryIndex];
    let categoryNameElement = categoryDiv.querySelector('span[data-v-c24acdb4]');
    let categoryName = categoryNameElement ? categoryNameElement.textContent : "";

    let productCards = categoryDiv.querySelectorAll('.item-card.col-8.category-container__products__product-list__item-card.not-small');

    let productData = [];
    for await (const productIndex of [...Array(productCards.length).keys()]) {
      await sleep(500)
      let categoryDivs = document.querySelectorAll('.category-container[data-v-c24acdb4]');
      let categoryDiv = categoryDivs[categoryIndex];
      let productCards = categoryDiv.querySelectorAll('.item-card.col-8.category-container__products__product-list__item-card.not-small');
      let productCard = productCards[productIndex];

      console.log(productCard.textContent); //debuging..

      let innerDiv = productCard.querySelector('.item-card-container.row.justify-between');
      if (innerDiv) {
        await sleep(500)
        innerDiv.click();
        console.log("clicou")
        // Agora, vamos adicionar um atraso antes de coletar os dados.
        await sleep(1000)

        let titleElement = document.querySelector('span.font-5');
        let priceElement = document.querySelector('span.price__now.font-3');
        let imgElement = document.querySelector('img');
        let descricaoElement = document.querySelector('span.weight-400');
        console.log("extraindo dados")
        let title = titleElement ? titleElement.textContent : "";
        let priceText = priceElement ? priceElement.textContent : "";
        let price = priceText.replace(/[^\d,.]/g, '').replace(',', '.');
        let imgSrc = imgElement ? imgElement.src : "";
        let descricao = descricaoElement ? descricaoElement.textContent : "";

        let complementsDict = []
        let complementExpandables = document.querySelectorAll('div.expandable');
        for await (const complementExpandable of complementExpandables) {
          let complementElements = complementExpandable.querySelectorAll('div.expandable__fixed.py-2.px-4.pointer.bg-grey-12');
          let optionsComplement = [];

          // Pegar o nome de cada complemento
          for await (const complementElement of complementElements) {
            let typeComplementElement = complementElement.querySelector('span.expandable__fixed__header__text__subtitle.font-1.text-grey');
            let requiredElement = complementElement.querySelector('span.expandable__fixed__header__text__required.font-0.ml-2.text-primary');
            let complementNameElement = complementElement.querySelector('span.expandable__fixed__header__text__title');

            let typeComplement = typeComplementElement ? typeComplementElement.textContent : "";
            let required = requiredElement ? requiredElement.textContent : "";
            let complementName = complementNameElement ? complementNameElement.textContent : "";

            // Pegar nome de cada opção do complemento da iteração
            let optionsElement = complementExpandable.querySelectorAll('.chooser');
            for await (const optionElement of optionsElement) {
              let optionTitleElement = optionElement.querySelector('span.weight-700.text-black.font-1.mb-1');
              let optionPriceElement = optionElement.querySelector('.price__now');
              let optionQtdElement = optionElement.querySelector('span.text-grey-3');
              let optionDescriptionElement = optionElement.querySelector('.chooser-info__description');

              let optionTitle = optionTitleElement ? optionTitleElement.textContent : "";
              let optionPriceText = optionPriceElement ? optionPriceElement.textContent : "0";
              let optionPrice = optionPriceText.replace(/[^\d,.]/g, '').replace(',', '.');
              let optionQtd = optionQtdElement ? optionQtdElement.textContent : "";
              let optionDescription = optionDescriptionElement ? optionDescriptionElement.textContent : "";

              optionsComplement.push({
                optionTitle: optionTitle,
                optionPrice: optionPrice,
                optionQtd: optionQtd,
                optionDescription: optionDescription
              });
            }
            console.log("options extraida")

            complementsDict.push({
              nameComplement: complementName,
              typeComplement: typeComplement,
              required: required,
              options: optionsComplement,
            })
          }
          console.log("complements extraida")
        }

        productData.push({
          title: title,
          price: price,
          imgSrc: imgSrc,
          descricao: descricao,
          complementsDict: complementsDict
        });
        console.log("productData extraido")
        await backPage();
      }
    }
    scrapedData.push({
      categoryName: categoryName,
      productsCategory: productData
    });
    console.log("scrapedData adicionado")
    await backPage();
  }
}

async function backPage() {
  await sleep(1000);
  let back = document.querySelector('#app > div.main-container.w-100.not-small.has-search-bar > div > div.w-100.item-header-container > div.navigation-header.flex.items-center.justify-between.navigation-header--small.bg-white > div:nth-child(1) > div > div');
  if (back) {
    back.click()
  }

}


function createCSV() {
  const Papa = require('papaparse');
  const csvData = [];

  // Cabeçalho do CSV
  csvData.push([
    'TIPO',
    'NOME',
    'DESCRIÇÃO',
    'VALOR',
    'IMAGEM',
    'CODIGO PDV',
    'DISPONIBILIDADE DO ITEM',
    'TIPO COMPLEMENTO',
    'QTDE MINIMA',
    'QTDE MAXIMA',
    'CALCULO DOS COMPLEMENTOS',
  ]);

  scrapedData.forEach(categoryData => {
    const categoryName = categoryData.categoryName;
    csvData.push(['Categoria', categoryName]);

    categoryData.productsCategory.forEach(productData => {
      const productName = productData.title;
      const productDescription = productData.descricao;
      const productPrice = productData.price;
      const imgSrc = productData.imgSrc;

      csvData.push(['Produto', productName, productDescription, productPrice, imgSrc]);

      productData.complementsDict.forEach(complementData => {
        const complementName = complementData.nameComplement;
        const complementType = complementData.typeComplement;
        const complementRequired = complementData.required ? 'Obrigatório' : 'Não';
        const complementMinQtd = complementData.minQtd;
        const complementMaxQtd = complementData.maxQtd;

        csvData.push(['Complemento', complementName, '', '', '', '', '', complementType, complementMinQtd, complementMaxQtd]);

        complementData.options.forEach(option => {
          const optionName = option.optionTitle;
          const optionPrice = option.optionPrice;
          const optionMaxQtd = option.optionQtd;

          csvData.push(['Opção', optionName, '', optionPrice, '', '', '', '', '', optionMaxQtd]);
        });
      });
    });
  });

  // Converter para CSV usando a biblioteca papaparse
  const csv = Papa.unparse(csvData);

  return csv;
}
