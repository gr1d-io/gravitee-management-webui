export class RegisterCreditCard {
    public user_id: string;
    public full_name: string;
    public type: number;
    public document: number;
    public phone: string;
    public date_of_birth: string;
    public card_number: string;
    public card_expiration_date: string;
    public card_cvv: string;
    public card_holder_name: string;

    constructor() {
      'ngInject';
    }
  }