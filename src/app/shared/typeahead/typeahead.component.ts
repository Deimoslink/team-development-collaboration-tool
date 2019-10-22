import {Component, ElementRef, forwardRef, Input, OnDestroy, OnInit} from '@angular/core';
import {DomSanitizer, SafeHtml} from "@angular/platform-browser";
import {ListItem, TypeaheadSource} from "../interfaces";
import {debounceTime, distinctUntilChanged, takeUntil} from "rxjs/operators";
import {ControlValueAccessor, NG_VALUE_ACCESSOR} from "@angular/forms";
import {Subject} from "rxjs";

@Component({
  selector: 'tdct-typeahead',
  templateUrl: './typeahead.component.html',
  styleUrls: ['./typeahead.component.scss'],
  host: {
    '(document:click)': 'onClick($event)',
  },
  providers: [{
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => TypeaheadComponent),
    multi: true
  }],
})
export class TypeaheadComponent implements OnInit, OnDestroy, ControlValueAccessor {
  @Input() public placeholder = 'type to search';
  @Input() public source: TypeaheadSource;
  public disabled = false;
  public options: Array<ListItem> = [];
  private _activeItem: ListItem | null = null;
  private keyboardInputs = new Subject<string>();
  private ngUnsubscribe = new Subject<void>();
  public showOptions = false;
  public hideInput = true;

  public constructor(private sanitizer: DomSanitizer, private elementRef: ElementRef) {
    this.closeOptions = this.closeOptions.bind(this);
  }

  private onTouchedCallback() {
  }

  private onChangeCallback(item: ListItem | null) {
  }

  public onClick(e: any) {
    if (!this.elementRef.nativeElement.contains(e.target)) {
      this.closeOptions();
    }
  }

  public inputFocused(): void {
    this.showOptions = true;
    this.hideInput = false;
    setTimeout(() => {
      this.elementRef.nativeElement.querySelector('#mainInput').focus();
    }, 10);
  }

  public sanitize(html: string): SafeHtml {
    return this.sanitizer.bypassSecurityTrustHtml(html);
  }

  public closeOptions(): void {
    this.elementRef.nativeElement.querySelector('#mainInput').value = '';
    this.keyboardInputs.next('');
    this.showOptions = false;
    this.hideInput = true;
  }

  public onInput(value: string): void {
    this.keyboardInputs.next(value);
  }

  public onPaste(value: string): void {
    this.keyboardInputs.next(value);
  }

  public setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  public selectMatch(option: ListItem) {
    this.writeValue(option);
    setTimeout(() => {
      this.closeOptions();
    }, 10);
  }

  public clearSelection(): void {
    this.writeValue(null);
  }

  get activeItem(): ListItem | null {
    return this._activeItem;
  }

  set activeItem(item: ListItem | null) {
    this._activeItem = item;
    this.onChangeCallback(this.activeItem);
  }

  writeValue(value: ListItem | null) {
    this.activeItem = value;
  }

  registerOnChange(fn: any) {
    this.onChangeCallback = fn;
  }

  registerOnTouched(fn: any) {
    this.onTouchedCallback = fn;
  }

  ngOnInit(): void {

    this.keyboardInputs.pipe(
      takeUntil(this.ngUnsubscribe),
      debounceTime(300),
      distinctUntilChanged(),
    ).subscribe((value: string) => {
      if (value) {
        const sourceObservable = this.source(value);
        sourceObservable.pipe(
          takeUntil(this.ngUnsubscribe)
        ).subscribe((res: Array<ListItem>) => {
          this.options = res;
        });
      } else {
        this.options = [];
      }
    });

  }

  ngOnDestroy(): void {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

}