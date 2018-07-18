
class Gr1dCreditCardsService {
  private creditCardsURL: string;

  constructor(private $http, ConstantsGr1d) {
    'ngInject';
    this.creditCardsURL = `${ConstantsGr1d.basePortalBackendURL}billing/`;
  }
  
  get(userId: string): ng.IHttpPromise<any> {
    return this.$http.get(`${this.creditCardsURL}cardInfo/${userId}`);
  }

  create(registerCreditCard): ng.IHttpPromise<any> {
    this.creditCardsURL = 'http://35.198.33.182/billing/';
    return this.$http.post(`${this.creditCardsURL}authorizeCard`, registerCreditCard);
  }

}

export default Gr1dCreditCardsService;
