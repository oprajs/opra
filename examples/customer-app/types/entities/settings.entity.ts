import { ApiField, ComplexType } from '@opra/common';
import { Column, Entity, PrimaryKey } from '@sqb/connect';

@ComplexType({
  description: 'Settings'
})
@Entity({tableName: 'settings'})
export class Settings {

  constructor(init: Partial<Settings>) {
    Object.assign(this, init);
  }

  @Column({notNull: true})
  @PrimaryKey()
  id: number;

  @ApiField()
  @Column({fieldName: 'company_name'})
  companyName: string;

  @ApiField()
  @Column({fieldName: 'company_email'})
  companyEmail: string;

  @ApiField()
  @Column({fieldName: 'session_timeout'})
  sessionTimeout: number;
}
