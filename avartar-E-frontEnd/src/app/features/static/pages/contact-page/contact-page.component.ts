import { Component } from '@angular/core';
import { SliderManagementComponent } from "../../../home/page/slider-management/slider-management.component";
import { Product3DViewerComponent } from "../../../products/components/product-three-d-viewer/product-three-d-viewer.component";
import { UserStatsCardComponent } from "../../../users/components/user-stats-card/user-stats-card.component";
import { AdminUser, UserStats } from '../../../users/models/user-management.interface';
import { UserFiltersComponent } from "../../../users/components/user-filters/user-filters.component";
import { UserActionsComponent } from "../../../users/components/user-actions/user-actions.component";
import { UserListComponent } from "../../../users/components/user-list/user-list.component";
import { last } from 'rxjs';

@Component({
  selector: 'app-contact-page',
  imports: [SliderManagementComponent],
  templateUrl: './contact-page.component.html',
  styleUrl: './contact-page.component.scss',

})
export class ContactPageComponent {

}
