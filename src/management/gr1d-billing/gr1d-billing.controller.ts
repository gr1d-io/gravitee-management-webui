import Gr1dCreditCardsService from "../../services/gr1d.creditCards.service";
import { CreditCard } from "../../entities/creditCard";
import UserService from "../../services/user.service";
import { User } from "../../entities/user";
import Gr1dInvoicesService from "../../services/gr1d.invoices.service";
import * as _ from 'lodash';

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
class Gr1dBillingController {
    public creditCard: CreditCard;
    public invoices: any;
    private user: User;

    constructor(
      private $scope,
      private UserService: UserService,
      private Gr1dCreditCardsService: Gr1dCreditCardsService,
      private Gr1dInvoicesService: Gr1dInvoicesService,

    ) {
      'ngInject';
      this.getUserCurrent();
    }


    getUserCurrent() {
      this.UserService.current().then(user => {
        this.user = user;
        this.user.id = '9f4ffe83-ba3d-4836-8870-f73a165fb642';
        this.getCreditCards(user.id);
        this.getInvoices(user.id);
      });
    }


    getCreditCards(id: string) {
      this.Gr1dCreditCardsService.get(id).then(response => {
        console.log('getCreditCards', response);
        if (!_.isEmpty(response.data)) {
          this.creditCard = response.data as CreditCard;
        }
      }).catch(reason => {
        console.log('reason', reason);        
      });
    }

    getInvoices(id: string) {
      this.Gr1dInvoicesService.getList(id).then(response => {
        console.log('getInvoices', response);
        if (!_.isEmpty(response.data.content)) {
          this.invoices = response.data.content;
        }
      }).catch(reason => {
        console.log('reason', reason);        
      });
    }

    transformMoney(amount: number) {
      if (amount) {
        const value = amount / 100;
        const rest = amount % 100;
        if (rest > 0) {
          return `${value}.${rest}`;
        }

        return value;
      }

      return 0;
    }
  }
  export default Gr1dBillingController;