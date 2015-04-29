//
//  CUTEFormRoomsPickerCell.m
//  currant
//
//  Created by Foster Yin on 4/29/15.
//  Copyright (c) 2015 Foster Yin. All rights reserved.
//

#import "CUTEFormRoomsPickerCell.h"
#import "CUTECommonMacro.h"
#import "CUTEPropertyInfoForm.h"

@implementation CUTEFormRoomsPickerCell

- (void)setUp {
    [super setUp];
}

- (void)update
{
    self.textLabel.text = self.field.title;

    CUTEPropertyInfoForm *form = (CUTEPropertyInfoForm *)self.field.form;
    self.detailTextLabel.text = [NSString stringWithFormat:@"%d室%d厅%d卫", form.bedroomCount, form.livingroomCount, form.bathroomCount];

    [@[@"bedroomCount", @"livingroomCount", @"bathroomCount"] enumerateObjectsUsingBlock:^(id obj, NSUInteger idx, BOOL *stop) {
        if ([[form valueForKey:obj] integerValue] < [self.pickerView numberOfRowsInComponent:idx]) {
            [self.pickerView selectRow:[[form valueForKey:obj] integerValue] inComponent:idx animated:NO];
        }
    }];

}

- (BOOL)canBecomeFirstResponder
{
    return YES;
}

- (UIView *)inputView
{
    return self.pickerView;
}

- (NSInteger)numberOfComponentsInPickerView:(__unused UIPickerView *)pickerView
{
    return 3;
}

- (NSInteger)pickerView:(__unused UIPickerView *)pickerView numberOfRowsInComponent:(__unused NSInteger)component
{
    return 30;
}

- (NSString *)pickerView:(__unused UIPickerView *)pickerView titleForRow:(NSInteger)row forComponent:(__unused NSInteger)component
{
    return [NSString stringWithFormat:@"%d%@", row, @[STR(@"室"), STR(@"厅"), STR(@"卫")][component]];
}

- (void)pickerView:(__unused UIPickerView *)pickerView didSelectRow:(NSInteger)row inComponent:(__unused NSInteger)component
{

    CUTEPropertyInfoForm *form = (CUTEPropertyInfoForm *)self.field.form;
    [form setValue:@(row) forKey:@[@"bedroomCount", @"livingroomCount", @"bathroomCount"][component]];
    self.detailTextLabel.text = [NSString stringWithFormat:@"%d室%d厅%d卫", form.bedroomCount, form.livingroomCount, form.bathroomCount];
    if (self.field.action) self.field.action(self);
}



@end
