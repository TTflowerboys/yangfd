//
//  CUTEFormTextFieldCell.m
//  currant
//
//  Created by Foster Yin on 4/30/15.
//  Copyright (c) 2015 Foster Yin. All rights reserved.
//

#import "CUTEFormFixNonBreakingSpaceTextFieldCell.h"

@implementation CUTEFormFixNonBreakingSpaceTextFieldCell

//http://stackoverflow.com/questions/19569688/right-aligned-uitextfield-spacebar-does-not-advance-cursor-in-ios-7
- (BOOL)textField:(UITextField *)textField shouldChangeCharactersInRange:(NSRange)range replacementString:(NSString *)string {
    // only when adding on the end of textfield && it's a space
    if (range.location == textField.text.length && [string isEqualToString:@" "]) {
        // ignore replacement string and add your own
        textField.text = [textField.text stringByAppendingString:@"\u00a0"];
        return NO;
    }
    // for all other cases, proceed with replacement
    return YES;
}

- (void)update
{
    [super update];
    self.textField.text = [[self.field fieldDescription] stringByReplacingOccurrencesOfString:@" " withString:@"\u00a0"];
    [self.textField setNeedsDisplay];
}

- (void)updateFieldValue
{
    self.field.value = [[self.textField.text stringByReplacingOccurrencesOfString:@"\u00a0" withString:@" "] stringByTrimmingCharactersInSet:[NSCharacterSet whitespaceCharacterSet]];
}

@end
