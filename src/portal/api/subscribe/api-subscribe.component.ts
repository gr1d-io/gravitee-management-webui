/*
 * Copyright (C) 2015 The Gravitee team (http://gravitee.io)
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *         http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import ApplicationService from "../../../services/applications.service";
import ApiService from "../../../services/api.service";
import NotificationService from "../../../services/notification.service";
import {RegisterCreditCard} from "../../../entities/registerCreditCard";
import {CreditCard} from "../../../entities/creditCard";

import * as _ from "lodash";
import Gr1dCreditCardsService from "../../../services/gr1d.creditCards.service";
import UserService from "../../../services/user.service";
import { User } from "../../../entities/user";

const ApiSubscribeComponent: ng.IComponentOptions = {
  bindings: {
    api: '<',
    plans: '<',
    applications: '<',
    subscriptions: '<'
  },
  template: require('./api-subscribe.html'),
  controller: class {

    private api: any;
    private plans: any;

    private selectedPlan: any;
    private selectedApp: any;

    private planInformation: any;
    private apiKey: any;
    private subscription: any;
    private requestMessage: string;
    private registerCreditCard: RegisterCreditCard = {
      user_id: '',
      full_name: '',
      email: '',
      document: '',
      document_type: 1,
      phone: '',
      date_of_birth: '',
      card_number: '',
      card_expiration_date: '',
      card_cvv: '',
      card_holder_name: ''
    };

    private user: User;
    public icons: any;

    public hasCreditCardsEnabled: boolean = false;
    public changeCreditCard: boolean = false;
    public creditCard: CreditCard;

    constructor(
      private $stateParams: ng.ui.IStateParamsService,
      private NotificationService: NotificationService,
      private ApplicationService: ApplicationService,
      private ApiService: ApiService,
      private Constants,
      private ConstantsGr1d,
      private UserService: UserService,
      private Gr1dCreditCardsService: Gr1dCreditCardsService,
      private $scope: ng.IScope) {
      'ngInject';

      this.icons = ConstantsGr1d.theme.icons;

      this.getUserCurrent();

    }

    $onInit() {
      this.selectedPlan = _.find(this.plans, (plan: any) => {
        return plan.id === this.$stateParams.planId;
      });
    }

    checkSubscriptions() {
      if (this.selectedApp) {
        this.ApplicationService.listSubscriptions(this.selectedApp.id, '?status=accepted,pending&plan=' + this.selectedPlan.id)
          .then((subscriptions: any) => {
            this.subscription = subscriptions.data.data[0];
            if (this.subscription !== undefined) {
              this.fetchApiKey(this.subscription.id);
            }
        });
      }
    }

    fetchApiKey(subscriptionId) {
      this.ApplicationService.listApiKeys(this.selectedApp.id, subscriptionId).then( (apiKeys) => {
        let apiKey = _.find(apiKeys.data, function (apiKey: any) {
          return !apiKey.revoked;
        });
        if (apiKey) {
          this.apiKey = apiKey.key;
        }
      });
    }

    subscribe(application: any) {
      this.ApplicationService.subscribe(application.id, this.selectedPlan.id, this.requestMessage).then( (subscription) => {
        this.subscription = subscription.data;
        this.NotificationService.show('api.subscription.step3.successful', null, {planName: this.selectedPlan.name});
        this.fetchApiKey(this.subscription.id);

        
      });
    }

    showMessagePending() {
      return this.subscription && this.subscription.status === 'pending' && this.hasCreditCards()
    }

    isPlanSubscribable() {
      return this.selectedPlan && 'key_less' !== this.selectedPlan.security;
    }

    canApplicationSubscribe() {
      return this.isPlanSubscribable()
        && this.selectedApp
        && ! this.subscription
        && (
          (('oauth2' === this.selectedPlan.security || 'jwt' === this.selectedPlan.security) && this.selectedApp.clientId)
          || (this.selectedPlan.security === 'api_key')
        );
    }

    onApiKeyClipboardSuccess(e) {
      this.NotificationService.show('api.subscription.step3.apikey.clipboard');
      e.clearSelection();
    }

    onApplicationSearchChange() {
      delete this.apiKey;
      delete this.selectedApp;
      delete this.subscription;
      this.checkSubscriptions();
    }

    onApplicationSelect() {
      this.checkSubscriptions();
    }

    onPlanSelect() {
      delete this.selectedApp;
      delete this.subscription;
    }

    getApiKeyCurlSample() {
      return 'curl -X GET "' + this.Constants.portal.entrypoint + this.api.context_path +
        '" -H "' + this.Constants.portal.apikeyHeader + ': ' + (this.apiKey ? this.apiKey : 'given_api_key') + '"';
    }

    getOAuth2CurlSample() {
      return 'curl -X GET "' + this.Constants.portal.entrypoint + this.api.context_path +
        '" -H "Authorization: Bearer xxxx-xxxx-xxxx-xxxx"';
    }

    getUserCurrent() {
      this.UserService.current().then(user => {
        this.user = user;
        this.getCreditCards(user.id);
      });
    }

    getCreditCards(id: string) {
      this.Gr1dCreditCardsService.get(id).then(response => {
        console.log('responseCreditCards', response);
        this.creditCard = response.data as CreditCard;
        if (this.creditCard.card_first_digits && this.creditCard.card_holder_name) {
          console.log('this.creditCard', this.creditCard);

          this.hasCreditCardsEnabled = this.creditCard.valid;


          // TODO - Don`t work update form with valid data
          this.registerCreditCard.full_name = this.creditCard.personal_info.full_name;
          this.registerCreditCard.date_of_birth = this.creditCard.personal_info.date_of_birth;
          this.registerCreditCard.email = this.creditCard.personal_info.email;
          this.registerCreditCard.phone = this.creditCard.personal_info.phone;
          this.registerCreditCard.document = this.creditCard.personal_info.document;

          console.log('this.registerCreditCard', this.registerCreditCard);

        }
      }).catch(reason => {
        console.log('reason', reason);        
      });
    }

    sendCreditCard(registerCreditCard: RegisterCreditCard) {
      console.log('registerCreditCard', registerCreditCard);
      const document = registerCreditCard.document.replace(/\D/g,'');
      const cvv = registerCreditCard.card_cvv + '';
      console.log('user', this.user);

      const request = {
        user_id: this.user.id,
        full_name: registerCreditCard.full_name,
        date_of_birth: registerCreditCard.date_of_birth,
        email: registerCreditCard.email,
        phone: '+' + registerCreditCard.phone,
        document_type: document.length <= 11 ? 1 : 2, 
        document: document,
        card_holder_name: registerCreditCard.card_holder_name,
        card_number: registerCreditCard.card_number.replace(/\D/g,''),
        card_expiration_date: this.getExpirationDate(registerCreditCard.card_expiration_date),
        card_cvv: cvv.replace(/\D/g,'')
      };

      console.log('request', request);

      // TODO Get Email from keycloak
      // this.UserService.search('email').then(response => {
      //   console.log('response', response);
      // });

      this.creditCard = {
        card_first_digits: '',
        card_last_digits: request.card_number.slice(-4),
        card_holder_name: request.card_holder_name,
        valid: true,
        personal_info: {
          full_name: request.full_name,
          email: request.email
        }
      };

      this.Gr1dCreditCardsService.create(request).then(response => {
        console.log('response', response);
        const responseBody = response as any;
        if (responseBody.status == "ok") {
          this.creditCard = {
            card_first_digits: '',
            card_last_digits: request.card_number.slice(-4),
            card_holder_name: request.card_holder_name,
            valid: true,
            personal_info: {
              full_name: request.full_name,
              email: request.email
            }
          };
        }
      }).catch(reason => {
        console.log('reason', reason);
        if (reason.data) {
          const error = reason.data.error;
          console.log('errors', error);
          this.NotificationService.showError('', this.mountMessageError(error));
        }
      });
    }

    mountMessageError(error: any): string {
      let messageError = [];
      if (error.details && error.details.length > 0) {
        error.details.map(error => {
          messageError.push(error.message);
        });

        return messageError.join(', ');
      }

      if (!error.details) {
        return error.message;
      }
    }

    getExpirationDate(date: any) {
      if (date) {
        const month = date.getMonth() + 1;
        return (month < 10 ? '0' + month : month) + (date.getFullYear() + '').slice(-2);
      }
      return ''
    }

    hasCreditCards() {
      return this.creditCard;
    }

    changeCard() {
      console.log('changeCard');
      this.changeCreditCard = true;
    }

    closeFormCreditCard() {
      this.changeCreditCard = false;
    }

    showFormCreditCard() {
      return !this.hasCreditCards() || this.changeCreditCard;
    }

    showCloseFormCreditCard() {
      return true;
    }
  }
};

export default ApiSubscribeComponent;
