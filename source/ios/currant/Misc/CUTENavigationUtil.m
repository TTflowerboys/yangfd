//
//  CUTENavigationUtil.m
//  currant
//
//  Created by Foster Yin on 5/5/15.
//  Copyright (c) 2015 Foster Yin. All rights reserved.
//

#import "CUTENavigationUtil.h"
#import "CUTECommonMacro.h"

@implementation CUTENavigationUtil

+ (UIBarButtonItem *)backBarButtonItemWithTarget:(id)target action:(SEL)action
{
    UIButton *button =  [UIButton buttonWithType:UIButtonTypeCustom];
    [button setImage:[UIImage imageNamed:@"nav-back"] forState:UIControlStateNormal];
    [button setImageEdgeInsets:UIEdgeInsetsMake(0, 0, 0, 42)];
    [button setFrame:CGRectMake(0, 0, 53, 31)];
    UILabel *label = [[UILabel alloc]initWithFrame:CGRectMake(15, 5, 40, 20)];
    [label setFont:[UIFont systemFontOfSize:17]];
    [label setText:STR(@"返回")];
    label.textAlignment = NSTextAlignmentCenter;
    [label setTextColor:HEXCOLOR(0xe62e3c, 1)];
    [label setBackgroundColor:[UIColor clearColor]];
    [button addSubview:label];
    UIBarButtonItem *barButton = [[UIBarButtonItem alloc] initWithCustomView:button];
    [button addTarget:target action:action forControlEvents:UIControlEventTouchUpInside];
    return barButton;
}

@end
