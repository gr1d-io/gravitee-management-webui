import { PersonalInfo } from "./personalInfo";

export class CreditCard {
    public card_first_digits: string;
    public card_holder_name: string;
    public card_last_digits: string;
    public valid: boolean = false;
    public personal_info: PersonalInfo; 
    constructor() {
      'ngInject';
    }
  }