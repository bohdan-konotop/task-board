import { Component } from '@angular/core';
import { DatabaseService } from '@services/database.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
})
export class HeaderComponent {
  public projects = this.db.getBoards();

  constructor(private db: DatabaseService) {}
}
