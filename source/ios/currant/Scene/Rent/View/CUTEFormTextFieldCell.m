//
//  CUTEFormTextFieldCell.m
//  currant
//
//  Created by Foster Yin on 5/8/15.
//  Copyright (c) 2015 Foster Yin. All rights reserved.
//

#import "CUTEFormTextFieldCell.h"
#import "BBTInputAccessoryView.h"
#import "CUTECommonMacro.h"
#import "CUTEUIMacro.h"

@implementation CUTEFormTextFieldCell

+ (CGFloat)heightForField:(FXFormField *)field width:(CGFloat)width
{
    return CUTE_CELL_DEFAULT_HEIGHT;
}

- (void)update {
    [super update];
    self.textLabel.textColor = HEXCOLOR(0x333333, 1.0);
    self.textLabel.font = [UIFont systemFontOfSize:16];
    self.textField.accessibilityLabel = self.textLabel.text;
}

- (void)setUp {
    [super setUp];
    BBTInputAccessoryView *inputAccessoryView = [[BBTInputAccessoryView alloc] initWithFrame:CGRectMake(0, 0, ScreenWidth, 40)];
    inputAccessoryView.inputView = self.textField;
    self.textField.inputAccessoryView = inputAccessoryView;
}

- (void)textFieldDidBeginEditing:(__unused UITextField *)textField
{
    //disable select all when begin editing
}

@end
