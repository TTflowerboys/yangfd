//
//  CUTEListViewController.h
//  currant
//
//  Created by Foster Yin on 6/1/15.
//  Copyright (c) 2015 Foster Yin. All rights reserved.
//

#import "CUTECDVViewController.h"

@interface CUTEListViewController : CUTECDVViewController

@property (nonatomic, readonly) UIButton *mapButton;

@end


@interface CUTEListViewController (Subclass)

- (void)onMapButtonPressed:(id)sender;

@end
