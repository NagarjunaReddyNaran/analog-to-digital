import { AfterViewInit, Component, HostListener } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { UserIdleService } from 'angular-user-idle';
import { Subject } from 'rxjs';
import { EDIT, HOUR, MINUTE, SECOND } from './constants';
import { TimeoutComponent } from './timeout/timeout.component';

@Component({
	selector: 'app-root',
	templateUrl: './app.component.html',
	styleUrls: [ './app.component.css' ]
})
export class AppComponent implements AfterViewInit {
	hourHandStyle: any;
	minuteHandStyle: any;
	secondHandStyle: any;
	userActivity: any;
	userInactive: Subject<any> = new Subject();
	hour: number = 0;
	minute: number = 0;
	second: number = 0;
	editTime: boolean = true;
	timeInterval: any;
	time: string | undefined;

	constructor(private router: Router, public dialog: MatDialog) {
		this.setTimeout();
		this.userInactive.subscribe(() => {
			console.log('user has been inactive for 3m');
			this.openDialog();
		});
	}

	// User will be re-directed to Google page after 3 minutes
	setTimeout() {
		this.userActivity = setTimeout(() => {
			this.userInactive.next(undefined);
		}, 180000);
	}

  //Opens dialog, if user idle for 3mins
	openDialog() {
		const dialogRef = this.dialog.open(TimeoutComponent);

		dialogRef.afterClosed().subscribe((result) => {
			console.log(`Dialog result: ${result}`);
			if (result) {
				clearTimeout(this.userActivity);
				this.setTimeout();
			} else {
				window.location.href = 'https://www.google.com/';
			}
		});
	}

  // Listener for mouse move event
	@HostListener('window:mousemove')
	private refreshUserState() {
		clearTimeout(this.userActivity);
		this.setTimeout();
	}
  // Listener for keys down event
	@HostListener('window:keydown', [ '$event' ])
	private handleKeyDown(event: KeyboardEvent) {
		clearTimeout(this.userActivity);
		this.setTimeout();
	}

  // Listener for mouse wheel event
	@HostListener('document:wheel', [ '$event.target' ])
	onScroll(): void {
		clearTimeout(this.userActivity);
		this.setTimeout();
	}

	ngAfterViewInit(): void {
		this.getTime('');
	}
  reset(){
    this.editTime = true;
    this.getTime('');
  }

	animateAnalogClock() {
		this.hourHandStyle = {
			transform: `translate3d(-50%, 0, 0) rotate(${this.hour * 30 +
				this.minute * 0.5 +
				this.second * (0.5 / 60)}deg)`
		};

		this.minuteHandStyle = {
			transform: `translate3d(-50%, 0, 0) rotate(${this.minute * 6 + this.second * 0.1}deg)`
		};

		this.secondHandStyle = { transform: `translate3d(-50%, 0, 0) rotate(${this.second * 6}deg)` };
	}

	getTime(type: string) {
		this.timeInterval = setInterval(() => {
      let now = new Date();
      if(type != EDIT){
        let hours = ('0' + now.getHours()).slice(-2);
        let minutes = ('0' + now.getMinutes()).slice(-2);
        let seconds = ('0' + now.getSeconds()).slice(-2);

        this.hour = Number(hours);
        this.minute = Number(minutes);
        this.second = Number(seconds);
      }
      else{
        now.setHours(this.hour, this.minute, this.second);
      }
			this.animateAnalogClock();
		}, 1000);
		return this.timeInterval;
	}

	onChange(event: any, type: string) {
		if (type == HOUR) {
			this.hour = event.target.value;
		}
		if (type == MINUTE) {
			this.minute = event.target.value;
		}
		if (type == SECOND) {
			this.second = event.target.value;
		}
		this.animateAnalogClock();
	}

	onTimeChange() {
		this.editTime = !this.editTime;
		if (!this.editTime) {
			clearInterval(this.timeInterval);
		} else {
			this.getTime(EDIT);
		}
	}
}
