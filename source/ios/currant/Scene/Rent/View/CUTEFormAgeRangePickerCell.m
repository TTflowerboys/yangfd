//
//  CUTEFormRangePickerCell.m
//  currant
//
//  Created by Foster Yin on 1/13/16.
//  Copyright © 2016 BBTechgroup. All rights reserved.
//

#import "CUTEFormAgeRangePickerCell.h"
#import "CUTECommonMacro.h"
#import "CUTEUIMacro.h"
#import "BBTInputAccessoryView.h"
#import "currant-Swift.h"

@implementation CUTEFormAgeRangePickerCell


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
    //get init value
    self.detailTextLabel.text = self.field.value;
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


+ (NSString *)formattedDisplayTextWithMinAge:(NSInteger)minAge maxAge:(NSInteger)maxAge {
    NSString *text = nil;
    if (minAge == 0 && maxAge == 0) {
        text = STR(@"不限");
    }
    else if (minAge > 0 && maxAge == 0) {
        text = [NSString stringWithFormat:STR(@"%d岁以上"), minAge];
    }
    else if (minAge == 0 && maxAge > 0) {
        text = [NSString stringWithFormat:STR(@"%d岁以下"), maxAge];
    }
    else {
        text = [NSString stringWithFormat:STR(@"%d岁~%d岁"), minAge, maxAge];
    }
    return text;
}

- (NSInteger)numberOfComponentsInPickerView:(__unused UIPickerView *)pickerView
{
    return 2;
}

- (NSInteger)pickerView:(__unused UIPickerView *)pickerView numberOfRowsInComponent:(__unused NSInteger)component
{
    return 200;
}

///Min Row 不限 1 2 3 ... 200
///Max Row 不限 1 2 3 ... 200
- (NSString *)pickerView:(__unused UIPickerView *)pickerView titleForRow:(NSInteger)row forComponent:(__unused NSInteger)component
{
    if (row == 0) {
        return STR(@"不限");
    }
    else {
        return [NSString stringWithFormat:@"%ld", row ];
    }
}

- (void)pickerView:(__unused UIPickerView *)pickerView didSelectRow:(NSInteger)row inComponent:(__unused NSInteger)component
{
    NSInteger minAge = [pickerView selectedRowInComponent:0];
    NSInteger maxAge = [pickerView selectedRowInComponent:1];

    if (minAge > 0 && maxAge > 0) {
        //in case of bad range
        if (component == 0) {
            if (row > maxAge) {
                [pickerView selectRow:maxAge inComponent:0 animated:NO];
            }
        }
        else if (component == 1) {
            if (row < minAge) {
                [pickerView selectRow:minAge inComponent:1 animated:NO];
            }
        }
    }

    //get new range
    minAge = [pickerView selectedRowInComponent:0];
    maxAge = [pickerView selectedRowInComponent:1];
    self.detailTextLabel.text = [CUTEFormAgeRangePickerCell formattedDisplayTextWithMinAge:minAge maxAge:maxAge];
}


@end
