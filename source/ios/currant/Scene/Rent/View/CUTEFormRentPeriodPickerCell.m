//
//  CUTEFormRentPeriodPickerCell.m
//  currant
//
//  Created by Foster Yin on 6/3/15.
//  Copyright (c) 2015 Foster Yin. All rights reserved.
//

#import "CUTEFormRentPeriodPickerCell.h"
#import "CUTECommonMacro.h"
#import "CUTERentPriceForm.h"
#import "CUTEUIMacro.h"
#import "BBTInputAccessoryView.h"
#import "CUTERentPeriodForm.h"

@implementation CUTEFormRentPeriodPickerCell


+ (CGFloat)heightForField:(FXFormField *)field width:(CGFloat)width
{
    return CUTE_CELL_DEFAULT_HEIGHT;
}

- (void)setUp {
    [super setUp];
}

- (void)update
{
    self.textLabel.textColor = HEXCOLOR(0x333333, 1.0);
    self.textLabel.font = [UIFont systemFontOfSize:16];

    self.textLabel.text = self.field.title;

    CUTERentPeriodForm *form = (CUTERentPeriodForm *)self.field.form;
    if (form.minimumRentPeriod) {
        self.detailTextLabel.text = [NSString stringWithFormat:@"%d%@", (int)form.minimumRentPeriod.value, form.minimumRentPeriod.unitForDisplay];
        [self.pickerView selectRow:(int)form.minimumRentPeriod.value inComponent:0 animated:NO];
        [self.pickerView selectRow:[[self rentPeriodUnitArray] indexOfObject:form.minimumRentPeriod.unit] inComponent:1 animated:NO];
    }
    else {
        self.detailTextLabel.text = @""; //init trigger label
    }
    [self setNeedsLayout];
}

- (NSUInteger)rentPeriodValueCount {
    return 36;
}

- (NSArray *)rentPeriodUnitArray {
    return @[@"day", @"week", @"month"];
}

- (BOOL)canBecomeFirstResponder
{
    return YES;
}

- (BOOL)resignFirstResponder {
    BOOL result = [super resignFirstResponder];
    if (self.field.action) self.field.action(self);
    return result;
}

- (UIView *)inputView
{
    return self.pickerView;
}

- (UIView *)inputAccessoryView {
    BBTInputAccessoryView *inputAccessoryView = [[BBTInputAccessoryView alloc] initWithFrame:CGRectMake(0, 0, ScreenWidth, 40)];
    inputAccessoryView.inputView = self;
    [inputAccessoryView removeDoneButtonEventHandler];
    [inputAccessoryView.doneButton addTarget:self action:@selector(onDoneButtonPressed:) forControlEvents:UIControlEventTouchUpInside];
    return inputAccessoryView;
}

- (void)onDoneButtonPressed:(id)sender {
//    if (self.field.action) self.field.action(self);
    [self resignFirstResponder];
}

- (NSInteger)numberOfComponentsInPickerView:(__unused UIPickerView *)pickerView
{
    return 2;
}

- (NSInteger)pickerView:(__unused UIPickerView *)pickerView numberOfRowsInComponent:(__unused NSInteger)component
{
    if (component == 0) {
        return [self rentPeriodValueCount];
    }

    return [self rentPeriodUnitArray].count;
}

- (NSString *)pickerView:(__unused UIPickerView *)pickerView titleForRow:(NSInteger)row forComponent:(__unused NSInteger)component
{
    if (component == 0) {
        return [@(row) stringValue];
    }

    return [CUTETimePeriod getDisplayUnitWithUnit:[self rentPeriodUnitArray][row]];
}

- (void)pickerView:(__unused UIPickerView *)pickerView didSelectRow:(NSInteger)row inComponent:(__unused NSInteger)component
{
    CUTERentPeriodForm *form = (CUTERentPeriodForm *)self.field.form;

    NSInteger rentPeriodValue = [self.pickerView selectedRowInComponent:0];
    if (rentPeriodValue > 0) {
        form.minimumRentPeriod = [CUTETimePeriod timePeriodWithValue:(int)[self.pickerView selectedRowInComponent:0] unit:[[self rentPeriodUnitArray] objectAtIndex:[self.pickerView selectedRowInComponent:1]]];
    }
    else {
        form.minimumRentPeriod = nil;
    }

    if (form.minimumRentPeriod) {
        self.detailTextLabel.text = [NSString stringWithFormat:@"%d%@", (int)form.minimumRentPeriod.value, form.minimumRentPeriod.unitForDisplay];
    }
    else {
        self.detailTextLabel.text = @""; //init trigger label
    }
    [self setNeedsLayout];
}



@end
