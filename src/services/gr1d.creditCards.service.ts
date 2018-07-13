
class Gr1dCreditCardsService {
  private creditCardsURL: string;

  constructor(private $http, ConstantsGr1d) {
    'ngInject';
    this.creditCardsURL = `${ConstantsGr1d.basePortalBackendURL}/billing/cardInfo/`;
  }
  
  get(userId: string): ng.IHttpPromise<any> {
    return this.$http.get(`${this.creditCardsURL}?userId=${userId}`);
  }

  create(registerCreditCard): ng.IHttpPromise<any> {
    return this.$http.post(`${this.creditCardsURL}/create`, registerCreditCard);
  }

}

export default Gr1dCreditCardsService;
