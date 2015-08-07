//
//  CUTEFormRoomsPickerCell.m
//  currant
//
//  Created by Foster Yin on 4/29/15.
//  Copyright (c) 2015 Foster Yin. All rights reserved.
//

#import "CUTEFormRoomsPickerCell.h"
#import "CUTECommonMacro.h"
#import "CUTEUIMacro.h"
#import "CUTEPropertyInfoForm.h"
#import <NSArray+ObjectiveSugar.h>
#import "BBTInputAccessoryView.h"

@implementation CUTEFormRoomsPickerCell

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

    CUTEPropertyInfoForm *form = (CUTEPropertyInfoForm *)self.field.form;
    [self setDisplayTitleWithForm:form];

    [@[@"bedroomCount", @"livingroomCount", @"bathroomCount"] eachWithIndex:^(id obj, NSUInteger idx) {
        if ([[form valueForKey:obj] integerValue] < [self.pickerView numberOfRowsInComponent:idx]) {
            [self.pickerView selectRow:[[form valueForKey:obj] integerValue] inComponent:idx animated:NO];
        }
    }];
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
    [inputAccessoryView.doneButton addTarget:self action:@selector(onDoneButtonPressed:) forControlEvents:UIControlEventTouchUpInside];
    return inputAccessoryView;
}

- (void)onDoneButtonPressed:(id)sender {
    if (self.field.action) self.field.action(self);
}

- (void)setDisplayTitleWithForm:(CUTEPropertyInfoForm *)form {
    if (form.bedroomCount == 0) {
        self.detailTextLabel.text = LocalizedRoomTitle([NSString stringWithFormat:@"%d%@", form.bedroomCount, @"室"]);
    }
    else {
        self.detailTextLabel.text = CONCAT(LocalizedRoomTitle([NSString stringWithFormat:@"%d%@", form.bedroomCount, @"室"]),
                                           LocalizedRoomTitle([NSString stringWithFormat:@"%d%@", form.livingroomCount, @"厅"]),
                                           LocalizedRoomTitle([NSString stringWithFormat:@"%d%@", form.bathroomCount, @"卫"]));
    }
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
    return LocalizedRoomTitle([NSString stringWithFormat:@"%d%@", row, @[@"室", @"厅", @"卫"][component]]);
}

- (void)pickerView:(__unused UIPickerView *)pickerView didSelectRow:(NSInteger)row inComponent:(__unused NSInteger)component
{
    CUTEPropertyInfoForm *form = (CUTEPropertyInfoForm *)self.field.form;
    [form setValue:@(row) forKey:@[@"bedroomCount", @"livingroomCount", @"bathroomCount"][component]];

    //Sudio cannot choose livingroom, bathroom
    if (form.bedroomCount == 0) {
        if (form.livingroomCount != 0) {
            [pickerView selectRow:0 inComponent:1 animated:NO];
            form.livingroomCount = 0;
            [form syncTicketWithBlock:^(CUTETicket *ticket) {
                ticket.property.livingroomCount = 0;
            }];
        }
        if (form.bathroomCount != 0) {
            [pickerView selectRow:0 inComponent:2 animated:NO];
            form.bathroomCount = 0;
            [form syncTicketWithBlock:^(CUTETicket *ticket) {
                ticket.property.bathroomCount = 0;
            }];
        }
    }

    [self setDisplayTitleWithForm:form];
}



@end
