//
//  CUTERentTypeListViewController.m
//  currant
//
//  Created by Foster Yin on 3/31/15.
//  Copyright (c) 2015 Foster Yin. All rights reserved.
//

#import "CUTERentTypeListViewController.h"
#import "CUTEPropertyInfoForm.h"
#import "CUTERectTypeListForm.h"
#import "CUTEFormDefaultCell.h"


@implementation CUTERentTypeListViewController

- (id)initWithNibName:(NSString *)nibNameOrNil bundle:(NSBundle *)nibBundleOrNil
{
    self = [super initWithNibName:nibNameOrNil bundle:nibBundleOrNil];
    if (self) {
        self.formController.form = [[CUTERectTypeListForm alloc] init];
        [self.formController registerDefaultFieldCellClass:[CUTEFormDefaultCell class]];
    }
    return self;
}

@end
