import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { ConfigurationService } from '../../../services/configuration.service';
import { Configuration, Pattern } from '../../../models/configuration.model';
import { TranslateService } from '@ngx-translate/core';
import { AppConfig } from '../../../services/app-config.service';

@Component({
  selector: 'app-configurator-filter',
  templateUrl: './configurator-filter.component.html',
  styleUrls: ['./configurator-filter.component.scss']
})

export class ConfiguratorFilterComponent implements OnInit {

  @Output() changed = new EventEmitter<any>();
  Pattern = Pattern;
  cByPat: Configuration[];
  cByPatMat: Configuration[];
  cByPatMatHW: Configuration[];
  cByPatMatHWHP: Configuration[];

  selectedPattern: Pattern = null;
  selectedMaterial: string = null;
  selectedHoleWidth: string = null;
  selectedHolePitch: string = null;

  overlayActive = false;

  customSelectToggles = {
    material: false,
    holeWidth: false,
    holePitch: false
  };

  stockUrl: string;

  constructor(private configurationService: ConfigurationService, public translate: TranslateService) {
    this.stockUrl = AppConfig.settings.stockUrl;
  }

  ngOnInit() {
    this.initializeValues();
  }

  initializeValues() {
    if (this.configurationService.dataLoaded) {
      this.selectChanged('pat', Pattern.Rg);
    } else {
      setTimeout(() => {
        this.initializeValues();
      });
    }
  }

  selectChanged(property: string, value?: any) {
    switch (property) {
      case 'pat':
        if (this.customSelectToggles.material) { this.customSelectToggles.material = false; }
        if (this.customSelectToggles.holeWidth) { this.customSelectToggles.holeWidth = false; }
        if (this.customSelectToggles.holePitch) { this.customSelectToggles.holePitch = false; }
        this.selectedPattern = value as Pattern;
        if (this.selectedPattern !== Pattern.In) {
          this.selectedMaterial = this.selectedHoleWidth = this.selectedHolePitch = null;
        } else {
          this.selectedMaterial = null;
          this.selectedHoleWidth = null;
          this.selectedHolePitch = null;
        }
        this.cByPat = this.configurationService.filterConfigurations(this.selectedPattern);
        // console.log('cByPat', this.cByPat);
        break;
      case 'material':
        if (this.selectedPattern !== Pattern.In) {
          this.selectedHoleWidth = this.selectedHolePitch = null;
        }
        this.cByPatMat = this.configurationService.filterConfigurations(this.selectedPattern, this.selectedMaterial).sort((a, b) => {
          const valA = Number(a.holeWidth.replace(',', '.'));
          const valB = Number(b.holeWidth.replace(',', '.'));
          if (valA > valB) {
              return 1;
            }
          if (valA < valB) {
            return -1;
          }
          return 0;
        });
        // console.log('cByPat', this.cByPatMat);
        break;
      case 'holeWidth':
        if (this.selectedPattern !== Pattern.In) {
          this.selectedHolePitch = null;
        }
        this.cByPatMatHW = this.configurationService.filterConfigurations(this.selectedPattern, this.selectedMaterial,
          this.selectedHoleWidth).sort((a, b) => {
          const valA = Number(a.holePitch.replace(',', '.'));
          const valB = Number(b.holePitch.replace(',', '.'));
          if (valA > valB) {
            return 1;
          }
          if (valA < valB) {
            return -1;
          }
          return 0;
        });
        // console.log('cByPat', this.cByPatMatHW);
        break;
      case 'holePitch':
        this.cByPatMatHWHP = this.configurationService.filterConfigurations(this.selectedPattern, this.selectedMaterial,
          this.selectedHoleWidth, this.selectedHolePitch);
        // console.log('cByPat', this.cByPatMatHWHP);
        break;
      default:
        break;
    }

    this.configurationService.setSelectedPattern(this.selectedPattern);
    this.configurationService.setSelectedMaterial(this.selectedMaterial);
    this.configurationService.setSelectedHoleWidth((this.selectedHoleWidth) ? this.selectedHoleWidth.toString() : this.selectedHoleWidth);
    this.configurationService.setSelectedHolePitch((this.selectedHolePitch) ? this.selectedHolePitch.toString() : this.selectedHolePitch);

    this.configurationService.resetResultSelections();

    const val = {
      pat: this.selectedPattern,
      material: this.selectedMaterial,
      holeWidth: this.selectedHoleWidth,
      holePitch: this.selectedHolePitch
    };
    this.changed.emit(val);
  }

  individualInputChanged(property: string) {
    switch (property) {
      case 'holeWidth':
        this.selectedHoleWidth = this.fixCustomInputValue(this.selectedHoleWidth);
        this.configurationService.setSelectedHoleWidth(this.selectedHoleWidth);
        break;
      case 'holePitch':
        this.selectedHolePitch = this.fixCustomInputValue(this.selectedHolePitch);
        this.configurationService.setSelectedHolePitch(this.selectedHolePitch);
        break;
      default:
        break;
    }
    this.selectChanged(property);
  }

  fixCustomInputValue(input: any): string {
    input = parseFloat(input.toString().replace(',', '.'));
    if (isNaN(input) || input === null || input < 0) {
      return null;
    } else {
      return parseFloat(input).toFixed(2).toString().replace('.', ',');
    }
  }

  getConfiguratorFigure(): string {
    if (this.selectedPattern !== Pattern.In) {
      let dir = 'material/';
      const img = ((this.selectedPattern) ? this.selectedPattern : 'Rg') + '.png';
      if (this.selectedMaterial && !this.selectedHoleWidth) {
        dir = 'hole_width/';
      } else if (this.selectedMaterial && this.selectedHoleWidth && !this.selectedHolePitch) {
        dir = 'hole_pitch/';
      }
      return dir + img;
    } else {
      return 'In.png';
    }
  }

  toggleCustomSelect(customSelect) {
    this.customSelectToggles[customSelect] = !this.customSelectToggles[customSelect];
    if (this.customSelectToggles[customSelect]) {
      Object.keys(this.customSelectToggles).forEach(toggleKey => {
        if (toggleKey !== customSelect) {
          this.customSelectToggles[toggleKey] = false;
        }
      });
    }
  }

}
