//
//  CUTEFormCountPickerCell.m
//  currant
//
//  Created by Foster Yin on 1/13/16.
//  Copyright © 2016 BBTechgroup. All rights reserved.
//

#import "CUTEFormRoommateCountPickerCell.h"
#import "CUTECommonMacro.h"
#import "CUTEUIMacro.h"
#import "BBTInputAccessoryView.h"

@implementation CUTEFormRoommateCountPickerCell

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
    [self resignFirstResponder];
    //    if (self.field.action) self.field.action(self);
}


- (NSInteger)numberOfComponentsInPickerView:(__unused UIPickerView *)pickerView
{
    return 1;
}

- (NSInteger)pickerView:(__unused UIPickerView *)pickerView numberOfRowsInComponent:(__unused NSInteger)component
{
    return 30;
}

- (NSString *)pickerView:(__unused UIPickerView *)pickerView titleForRow:(NSInteger)row forComponent:(__unused NSInteger)component
{
    return [NSString stringWithFormat:STR(@"%d人"), row];
}

- (void)pickerView:(__unused UIPickerView *)pickerView didSelectRow:(NSInteger)row inComponent:(__unused NSInteger)component
{
    self.detailTextLabel.text = [NSString stringWithFormat:STR(@"%d人"), row];
}


@end
