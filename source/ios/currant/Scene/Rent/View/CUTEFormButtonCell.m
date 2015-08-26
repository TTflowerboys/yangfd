//
//  CUTEFormButtonCell.m
//  currant
//
//  Created by Foster Yin on 4/2/15.
//  Copyright (c) 2015 Foster Yin. All rights reserved.
//

#import "CUTEFormButtonCell.h"
#import "CUTECommonMacro.h"
#import "CUTEUIMacro.h"

static UIView *CUTEFormsFirstResponder(UIView *view)
{
    if ([view isFirstResponder])
    {
        return view;
    }
    for (UIView *subview in view.subviews)
    {
        UIView *responder = CUTEFormsFirstResponder(subview);
        if (responder)
        {
            return responder;
        }
    }
    return nil;
}

@implementation CUTEFormButtonCell

+ (CGFloat)heightForField:(FXFormField *)field width:(CGFloat)width
{
    return CUTE_CELL_DEFAULT_HEIGHT;
}

- (void)setUp {
    [super setUp];
    self.accessoryType = UITableViewCellAccessoryNone;
    self.accessoryView = nil;
    self.accessibilityLabel = self.textLabel.text;
}

- (void)update {
    [super update];
    self.accessoryType = UITableViewCellAccessoryNone;
    self.accessoryView = nil;
}

- (void)setDisable:(BOOL)disable {
    _disable = disable;
    [self setNeedsLayout];
}

- (void)layoutSubviews {
    [super layoutSubviews];

    self.textLabel.textColor = [UIColor whiteColor];
    self.textLabel.font = [UIFont systemFontOfSize:16];
    self.textLabel.backgroundColor = _disable? HEXCOLOR(0x999999, 1): CUTE_MAIN_COLOR;
    self.textLabel.textAlignment = NSTextAlignmentCenter;
    self.textLabel.frame = self.bounds;
}

- (void)didSelectWithTableView:(UITableView *)tableView controller:(UIViewController *)controller
{
    if (!_disable) {
        [CUTEFormsFirstResponder(tableView) resignFirstResponder];
        self.field.action(self);
        [tableView deselectRowAtIndexPath:tableView.indexPathForSelectedRow animated:YES];
    }
}


@end
