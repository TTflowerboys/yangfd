//
//  OCBarButtonItem.m
//
//  Created by Olivier Collet on 11-10-24.
//  Copyright (c) 2011 Olivier Collet. All rights reserved.
//

#import "BBTWebBarButtonItem.h"

@interface BBTWebBarButtonItem ()

@property (copy, nonatomic) BBTActionBlock buttonActionBlock;

@end

@implementation BBTWebBarButtonItem
@synthesize buttonActionBlock;

+ (id)itemWithBarButtonSystemItem:(UIBarButtonSystemItem)systemItem actionBlock:(BBTActionBlock)actionBlock {
	BBTWebBarButtonItem *button = [[BBTWebBarButtonItem alloc] initWithBarButtonSystemItem:systemItem target:nil action:nil];
	[button setActionBlock:actionBlock];
	return button;
}

+ (id)itemWithCustomView:(UIView *)customView actionBlock:(BBTActionBlock)actionBlock {
	BBTWebBarButtonItem *button = [[BBTWebBarButtonItem alloc] initWithCustomView:customView];
	[button setActionBlock:actionBlock];
	return button;
}

+ (id)itemWithImage:(UIImage *)image style:(UIBarButtonItemStyle)style actionBlock:(BBTActionBlock)actionBlock {
	BBTWebBarButtonItem *button = [[BBTWebBarButtonItem alloc] initWithImage:image style:style target:nil action:nil];
	[button setActionBlock:actionBlock];
	return button;
}

+ (id)itemWithImage:(UIImage *)image landscapeImagePhone:(UIImage *)landscapeImagePhone style:(UIBarButtonItemStyle)style actionBlock:(BBTActionBlock)actionBlock {
	BBTWebBarButtonItem *button = [[BBTWebBarButtonItem alloc] initWithImage:image landscapeImagePhone:landscapeImagePhone style:style target:nil action:nil];
	[button setActionBlock:actionBlock];
	return button;	
}

+ (id)itemWithTitle:(NSString *)title style:(UIBarButtonItemStyle)style actionBlock:(BBTActionBlock)actionBlock {
	BBTWebBarButtonItem *button = [[BBTWebBarButtonItem alloc] initWithTitle:title style:style target:nil action:nil];
	[button setActionBlock:actionBlock];
	return button;
}

- (void)setActionBlock:(BBTActionBlock)actionBlock {
	self.buttonActionBlock = actionBlock;
	[self setTarget:self];
	[self setAction:@selector(executeActionBlock)];
}

- (void)executeActionBlock {
	if (self.buttonActionBlock) {
		self.buttonActionBlock(self.viewController);
	}
}

@end
